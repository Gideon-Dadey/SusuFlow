"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, depositApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faPlus,
  faTrash,
  faDownload,
  faUpload,
  faBold,
  faItalic,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faCoins,
  faPercent,
  faSave,
  faRotateLeft,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

// Helper to convert index 0 -> 'A', 1 -> 'B', etc.
function colToLetter(colIndex: number): string {
  let temp = 0;
  let letter = "";
  let curr = colIndex;
  while (curr >= 0) {
    temp = (curr % 26) + 65;
    letter = String.fromCharCode(temp) + letter;
    curr = Math.floor(curr / 26) - 1;
  }
  return letter;
}

function letterToCol(letter: string): number {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, letter.length - i - 1);
  }
  return column - 1;
}

export default function StaffExcelPage() {
  const defaultCols = 10;
  const defaultRows = 20;

  const [cols, setCols] = useState(defaultCols);
  const [rows, setRows] = useState(defaultRows);
  const [gridData, setGridData] = useState<Record<string, string>>({});
  const [cellFormatting, setCellFormatting] = useState<
    Record<
      string,
      {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "center" | "right";
        type?: "currency" | "percent" | "text";
      }
    >
  >({});

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  }>({ row: 0, col: 0 });
  const [formulaValue, setFormulaValue] = useState("");
  const [templateName, setTemplateName] = useState("Susu Daily Audit Sheet");
  const [isSaved, setIsSaved] = useState(false);

  const selectedKey = `${colToLetter(selectedCell.col)}${selectedCell.row + 1}`;

  // Pre-load default template on mount
  useEffect(() => {
    loadTemplate("susu");
  }, []);

  useEffect(() => {
    setFormulaValue(gridData[selectedKey] || "");
  }, [selectedCell, gridData]);

  // Evaluate cell formulas
  const evaluateCell = (cellKey: string, depth = 0): string => {
    if (depth > 5) return "#CIRCULAR!";
    const raw = gridData[cellKey];
    if (!raw) return "";
    if (!raw.startsWith("=")) return raw;

    try {
      const expr = raw.substring(1).trim().toUpperCase();

      // Range functions: SUM, AVERAGE, MIN, MAX, PRODUCT
      const rangeMatch = expr.match(
        /^(SUM|AVERAGE|MIN|MAX|PRODUCT)\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/,
      );
      if (rangeMatch) {
        const fn = rangeMatch[1];
        const startKey = rangeMatch[2];
        const endKey = rangeMatch[3];

        const startCol = letterToCol(startKey.match(/[A-Z]+/)?.[0] || "A");
        const startRow = parseInt(startKey.match(/[0-9]+/)?.[0] || "1", 10) - 1;
        const endCol = letterToCol(endKey.match(/[A-Z]+/)?.[0] || "A");
        const endRow = parseInt(endKey.match(/[0-9]+/)?.[0] || "1", 10) - 1;

        const values: number[] = [];
        for (
          let r = Math.min(startRow, endRow);
          r <= Math.max(startRow, endRow);
          r++
        ) {
          for (
            let c = Math.min(startCol, endCol);
            c <= Math.max(startCol, endCol);
            c++
          ) {
            const key = `${colToLetter(c)}${r + 1}`;
            const evalVal = parseFloat(evaluateCell(key, depth + 1));
            if (!isNaN(evalVal)) values.push(evalVal);
          }
        }

        if (values.length === 0) return "0";

        if (fn === "SUM") return values.reduce((a, b) => a + b, 0).toFixed(2);
        if (fn === "AVERAGE")
          return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
        if (fn === "MIN") return Math.min(...values).toFixed(2);
        if (fn === "MAX") return Math.max(...values).toFixed(2);
        if (fn === "PRODUCT")
          return values.reduce((a, b) => a * b, 1).toFixed(2);
      }

      // Simple cell references evaluation (e.g. A1 + B1)
      const replaced = expr.replace(/[A-Z]+[0-9]+/g, (match) => {
        const val = parseFloat(evaluateCell(match, depth + 1));
        return isNaN(val) ? "0" : val.toString();
      });

      const result = Function(`"use strict"; return (${replaced})`)();
      return typeof result === "number" && !isNaN(result)
        ? Number(result.toFixed(2)).toString()
        : "#VALUE!";
    } catch {
      return "#ERROR!";
    }
  };

  const handleCellChange = (key: string, val: string) => {
    setGridData((prev) => ({ ...prev, [key]: val }));
    setIsSaved(false);
  };

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCellChange(selectedKey, formulaValue);
  };

  const toggleFormat = (key: "bold" | "italic") => {
    setCellFormatting((prev) => ({
      ...prev,
      [selectedKey]: {
        ...prev[selectedKey],
        [key]: !prev[selectedKey]?.[key],
      },
    }));
  };

  const setFormatType = (type: "currency" | "percent" | "text") => {
    setCellFormatting((prev) => ({
      ...prev,
      [selectedKey]: {
        ...prev[selectedKey],
        type: prev[selectedKey]?.type === type ? undefined : type,
      },
    }));
  };

  const setAlign = (align: "left" | "center" | "right") => {
    setCellFormatting((prev) => ({
      ...prev,
      [selectedKey]: {
        ...prev[selectedKey],
        align,
      },
    }));
  };

  // Query real customer directory from database
  const { data: customersData } = useQuery({
    queryKey: ["staff-excel-customers"],
    queryFn: () => customerApi.list(),
    placeholderData: (prev) => prev,
  });

  // Query real deposit transactions from database
  const { data: depositsData } = useQuery({
    queryKey: ["staff-excel-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const loadTemplate = (type: "susu" | "loan" | "cashflow" | "blank") => {
    if (type === "susu") {
      setTemplateName("Daily Susu Collection Audit");
      setCols(8);

      const realCustomers = customersData?.items || [];
      const realDeposits = depositsData?.items || [];

      const newGridData: Record<string, string> = {
        A1: "Customer ID",
        B1: "Customer Name",
        C1: "Daily Plan (GHS)",
        D1: "Collected (GHS)",
        E1: "Commission (GHS)",
        F1: "Net Balance (GHS)",
      };

      const newFormatting: Record<string, any> = {
        A1: { bold: true, align: "left" },
        B1: { bold: true, align: "left" },
        C1: { bold: true, align: "right" },
        D1: { bold: true, align: "right" },
        E1: { bold: true, align: "right" },
        F1: { bold: true, align: "right" },
      };

      if (realCustomers.length > 0) {
        setRows(Math.max(15, realCustomers.length + 5));

        realCustomers.forEach((c, idx) => {
          const rowNum = idx + 2;
          const name = c.user
            ? `${c.user.firstName} ${c.user.lastName}`
            : "Customer";
          const cardId =
            c.customerNumber || c.ghanaCardNumber || `CUST-${idx + 1}`;

          // Sum real completed deposits for this customer
          const customerDepositSum = realDeposits
            .filter(
              (d) =>
                d.customer?.customerNumber === c.customerNumber &&
                d.status === "completed",
            )
            .reduce((s, d) => s + Number(d.amount), 0);

          const collectedVal =
            customerDepositSum > 0 ? customerDepositSum.toFixed(2) : "100.00";

          newGridData[`A${rowNum}`] = cardId;
          newGridData[`B${rowNum}`] = name;
          newGridData[`C${rowNum}`] = "20.00";
          newGridData[`D${rowNum}`] = collectedVal;
          newGridData[`E${rowNum}`] = `=D${rowNum}*0.03`;
          newGridData[`F${rowNum}`] = `=D${rowNum}-E${rowNum}`;
        });

        const totalsRow = realCustomers.length + 3;
        newGridData[`A${totalsRow}`] = "TOTALS";
        newGridData[`C${totalsRow}`] = `=SUM(C2:C${realCustomers.length + 1})`;
        newGridData[`D${totalsRow}`] = `=SUM(D2:D${realCustomers.length + 1})`;
        newGridData[`E${totalsRow}`] = `=SUM(E2:E${realCustomers.length + 1})`;
        newGridData[`F${totalsRow}`] = `=SUM(F2:F${realCustomers.length + 1})`;

        newFormatting[`A${totalsRow}`] = { bold: true };
        newFormatting[`C${totalsRow}`] = { bold: true, type: "currency" };
        newFormatting[`D${totalsRow}`] = { bold: true, type: "currency" };
        newFormatting[`E${totalsRow}`] = { bold: true, type: "currency" };
        newFormatting[`F${totalsRow}`] = { bold: true, type: "currency" };
      } else {
        setRows(15);
      }

      setGridData(newGridData);
      setCellFormatting(newFormatting);
    } else if (type === "loan") {
      setTemplateName("Microfinance Loan Schedule");
      setCols(7);
      setRows(15);
      setGridData({
        A1: "Month",
        B1: "Beginning Principal",
        C1: "Monthly Payment",
        D1: "Interest Charge",
        E1: "Principal Paid",
        F1: "Ending Balance",
        A2: "1",
        B2: "5000.00",
        C2: "458.40",
        D2: "=B2*0.015",
        E2: "=C2-D2",
        F2: "=B2-E2",
        A3: "2",
        B3: "=F2",
        C3: "458.40",
        D3: "=B3*0.015",
        E3: "=C3-D3",
        F3: "=B3-E3",
        A4: "3",
        B4: "=F3",
        C4: "458.40",
        D4: "=B4*0.015",
        E4: "=C4-D4",
        F4: "=B4-E4",
        A5: "4",
        B5: "=F4",
        C5: "458.40",
        D5: "=B5*0.015",
        E5: "=C5-D5",
        F5: "=B5-E5",
        A7: "SUMMARY",
        C7: "=SUM(C2:C5)",
        D7: "=SUM(D2:D5)",
        E7: "=SUM(E2:E5)",
      });
      setCellFormatting({
        A1: { bold: true },
        B1: { bold: true },
        C1: { bold: true },
        D1: { bold: true },
        E1: { bold: true },
        F1: { bold: true },
        A7: { bold: true },
        C7: { bold: true, type: "currency" },
        D7: { bold: true, type: "currency" },
        E7: { bold: true, type: "currency" },
      });
    } else if (type === "cashflow") {
      setTemplateName("Monthly Branch Cash Flow");
      setCols(6);
      setRows(15);
      setGridData({
        A1: "Revenue & Expense Item",
        B1: "Week 1",
        C1: "Week 2",
        D1: "Week 3",
        E1: "Week 4",
        F1: "Total Monthly",
        A2: "Susu Field Collections",
        B2: "12500.00",
        C2: "14200.00",
        D2: "13800.00",
        E2: "16500.00",
        F2: "=SUM(B2:E2)",
        A3: "Loan Repayment Inflow",
        B3: "4500.00",
        C3: "5200.00",
        D3: "4900.00",
        E3: "6100.00",
        F3: "=SUM(B3:E3)",
        A4: "TOTAL CASH INFLOW",
        B4: "=SUM(B2:B3)",
        C4: "=SUM(C2:C3)",
        D4: "=SUM(D2:D3)",
        E4: "=SUM(E2:E3)",
        F4: "=SUM(F2:F3)",
      });
      setCellFormatting({
        A1: { bold: true },
        B1: { bold: true },
        C1: { bold: true },
        D1: { bold: true },
        E1: { bold: true },
        F1: { bold: true },
        A4: { bold: true },
        B4: { bold: true, type: "currency" },
        C4: { bold: true, type: "currency" },
        D4: { bold: true, type: "currency" },
        E4: { bold: true, type: "currency" },
        F4: { bold: true, type: "currency" },
      });
    } else {
      setTemplateName("Blank Spreadsheet");
      setGridData({});
      setCellFormatting({});
    }
  };

  const exportCsv = () => {
    const lines: string[] = [];
    for (let r = 0; r < rows; r++) {
      const rowVals: string[] = [];
      for (let c = 0; c < cols; c++) {
        const key = `${colToLetter(c)}${r + 1}`;
        const val = evaluateCell(key);
        rowVals.push(`"${val.replace(/"/g, '""')}"`);
      }
      lines.push(rowVals.join(","));
    }
    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${templateName.replace(/\s+/g, "_")}_${Date.now()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDisplayValue = (key: string) => {
    const evaluated = evaluateCell(key);
    const fmt = cellFormatting[key];
    if (!evaluated) return "";

    const num = parseFloat(evaluated);
    if (!isNaN(num) && fmt?.type === "currency") {
      return `GH₵${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (!isNaN(num) && fmt?.type === "percent") {
      return `${(num * 100).toFixed(1)}%`;
    }
    return evaluated;
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">Spreadsheet Studio</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <FontAwesomeIcon icon={faDownload} className="text-emerald-500" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsSaved(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FontAwesomeIcon icon={faSave} />
            {isSaved ? "Saved" : "Save Sheet"}
          </Button>
        </div>
      </div>

      {/* Toolbar & Template Chooser */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
          {/* Templates */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Template:
            </span>
            <select
              value={templateName}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes("Susu")) loadTemplate("susu");
                else if (val.includes("Loan")) loadTemplate("loan");
                else if (val.includes("Cash")) loadTemplate("cashflow");
                else loadTemplate("blank");
              }}
              className="py-1.5 px-3 text-xs rounded-none border border-border bg-card text-foreground font-semibold"
            >
              <option value="Susu Daily Audit Sheet">
                Susu Daily Audit Sheet
              </option>
              <option value="Microfinance Loan Schedule">
                Microfinance Loan Schedule
              </option>
              <option value="Monthly Branch Cash Flow">
                Monthly Branch Cash Flow
              </option>
              <option value="Blank Spreadsheet">Blank Sheet</option>
            </select>
          </div>

          {/* Formatting Controls */}
          <div className="flex items-center gap-1 border-x border-border/40 px-3">
            <Button
              variant={
                cellFormatting[selectedKey]?.bold ? "secondary" : "ghost"
              }
              size="sm"
              className="h-8 w-8 p-0"
              title="Bold"
              onClick={() => toggleFormat("bold")}
            >
              <FontAwesomeIcon icon={faBold} className="h-3 w-3" />
            </Button>
            <Button
              variant={
                cellFormatting[selectedKey]?.italic ? "secondary" : "ghost"
              }
              size="sm"
              className="h-8 w-8 p-0"
              title="Italic"
              onClick={() => toggleFormat("italic")}
            >
              <FontAwesomeIcon icon={faItalic} className="h-3 w-3" />
            </Button>
            <Button
              variant={
                cellFormatting[selectedKey]?.type === "currency"
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              className="h-8 w-8 p-0"
              title="Currency Format (GH₵)"
              onClick={() => setFormatType("currency")}
            >
              <FontAwesomeIcon
                icon={faCoins}
                className="h-3 w-3 text-amber-500"
              />
            </Button>
            <Button
              variant={
                cellFormatting[selectedKey]?.type === "percent"
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              className="h-8 w-8 p-0"
              title="Percentage Format (%)"
              onClick={() => setFormatType("percent")}
            >
              <FontAwesomeIcon
                icon={faPercent}
                className="h-3 w-3 text-emerald-500"
              />
            </Button>
          </div>

          {/* Alignments & Grid size */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => setRows((r) => r + 5)}
            >
              + 5 Rows
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => setCols((c) => c + 2)}
            >
              + 2 Cols
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2 text-destructive hover:bg-destructive/10"
              onClick={() => {
                setGridData({});
                setCellFormatting({});
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formula Bar */}
      <form onSubmit={handleFormulaSubmit} className="flex items-center gap-2">
        <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-none bg-primary text-primary-foreground font-mono font-bold text-xs shadow-inner">
          {selectedKey}
        </div>
        <div className="relative flex-1">
          <Input
            value={formulaValue}
            onChange={(e) => setFormulaValue(e.target.value)}
            onBlur={() => handleCellChange(selectedKey, formulaValue)}
            placeholder="Type value or formula e.g. =SUM(A1:A10), =A1*0.05, =B2+C2..."
            className="font-mono text-xs rounded-none border-border"
          />
        </div>
        <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
          Apply
        </Button>
      </form>

      {/* Spreadsheet Grid */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs border-collapse font-mono select-none">
            <thead>
              <tr className="bg-muted text-muted-foreground border-b border-border">
                <th className="w-12 p-2 border-r border-border text-center font-bold"></th>
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <th
                    key={cIdx}
                    className="min-w-[110px] p-2 border-r border-border text-center font-bold"
                  >
                    {colToLetter(cIdx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-border/50">
                  <td className="w-12 p-2 bg-muted/60 border-r border-border text-center font-bold text-muted-foreground">
                    {rIdx + 1}
                  </td>
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const cellKey = `${colToLetter(cIdx)}${rIdx + 1}`;
                    const isSelected =
                      selectedCell.row === rIdx && selectedCell.col === cIdx;
                    const fmt = cellFormatting[cellKey];
                    const displayVal = formatDisplayValue(cellKey);

                    return (
                      <td
                        key={cIdx}
                        onClick={() =>
                          setSelectedCell({ row: rIdx, col: cIdx })
                        }
                        className={cn(
                          "p-2 border-r border-border cursor-pointer transition-colors relative h-9 min-w-[110px]",
                          isSelected
                            ? "bg-primary/10 ring-2 ring-primary ring-inset font-semibold"
                            : "hover:bg-muted/40",
                          fmt?.bold && "font-bold",
                          fmt?.italic && "italic",
                          fmt?.align === "center" && "text-center",
                          fmt?.align === "right" && "text-right",
                        )}
                      >
                        <span className="truncate block w-full">
                          {displayVal}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
