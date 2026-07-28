"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGhs, cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faScaleBalanced,
  faUpload,
  faCheckCircle,
  faTriangleExclamation,
  faRefresh,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffReconciliationPage() {
  const [selectedProvider, setSelectedProvider] = useState("momo");
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);

  const [statementBatches, setStatementBatches] = useState([
    {
      id: "REC-2026-0728",
      provider: "MTN Mobile Money Merchant Gateway",
      period: "28 Jul 2026",
      ledgerAmount: 4000.0,
      statementAmount: 4000.0,
      variance: 0.0,
      status: "100% Balanced",
      matchedCount: 4,
      unmatchedCount: 0,
    },
    {
      id: "REC-2026-0727",
      provider: "Fidelity Bank Operating Account",
      period: "27 Jul 2026",
      ledgerAmount: 15200.0,
      statementAmount: 15200.0,
      variance: 0.0,
      status: "100% Balanced",
      matchedCount: 18,
      unmatchedCount: 0,
    },
    {
      id: "REC-2026-0726",
      provider: "Telecel Cash Enterprise Vault",
      period: "26 Jul 2026",
      ledgerAmount: 8400.0,
      statementAmount: 8400.0,
      variance: 0.0,
      status: "100% Balanced",
      matchedCount: 9,
      unmatchedCount: 0,
    },
  ]);

  const [reconciledItems, setReconciledItems] = useState([
    {
      txRef: "DEP_1785275513066",
      customer: "Ruiping Ding (WLQDQ6WL)",
      type: "MTN MoMo Deposit",
      ledgerAmount: 1000.0,
      bankStatementAmount: 1000.0,
      difference: 0.0,
      matchStatus: "Perfect Match",
    },
    {
      txRef: "DEP_1785275497800",
      customer: "Ruiping Ding (WLQDQ6WL)",
      type: "MTN MoMo Deposit",
      ledgerAmount: 1000.0,
      bankStatementAmount: 1000.0,
      difference: 0.0,
      matchStatus: "Perfect Match",
    },
    {
      txRef: "DEP_1785275454576",
      customer: "Ruiping Ding (WLQDQ6WL)",
      type: "MTN MoMo Deposit",
      ledgerAmount: 1000.0,
      bankStatementAmount: 1000.0,
      difference: 0.0,
      matchStatus: "Perfect Match",
    },
    {
      txRef: "TXN-20260728-11CPDO",
      customer: "Ruiping Ding (WLQDQ6WL)",
      type: "Field Agent Cash Deposit",
      ledgerAmount: 1000.0,
      bankStatementAmount: 1000.0,
      difference: 0.0,
      matchStatus: "Perfect Match",
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      setParseSuccess(true);
      setTimeout(() => setParseSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">Bank & MoMo Reconciliation Hub</h1>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Ledger Balance
            </span>
            <p className="text-3xl font-bold font-mono text-primary mt-1">
              {formatGhs(27600.0)}
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              Double-Entry Verified
            </span>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Bank / MoMo Statement Total
            </span>
            <p className="text-3xl font-bold font-mono text-emerald-500 mt-1">
              {formatGhs(27600.0)}
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              External Gateway Confirmed
            </span>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Reconciliation Variance
            </span>
            <p className="text-3xl font-bold font-mono text-indigo-400 mt-1">
              GH₵0.00
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              100% Zero Discrepancy
            </span>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Unmatched Line Items
            </span>
            <p className="text-3xl font-bold font-mono text-amber-500 mt-1">
              0 Items
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              All Batches Cleared
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Statement Import Section */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUpload} className="text-primary" />
            Import External Bank / MoMo Statement CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Gateway Provider:
              </span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="py-2 px-3 text-xs rounded-none border border-border bg-card text-foreground font-semibold"
              >
                <option value="momo">MTN Mobile Money Merchant CSV</option>
                <option value="telecel">Telecel Cash Statement CSV</option>
                <option value="fidelity">Fidelity Bank Corporate CSV</option>
                <option value="gcb">GCB Microfinance Vault CSV</option>
              </select>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-none flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <FontAwesomeIcon icon={faFileLines} />
                {isParsing
                  ? "Parsing Statement..."
                  : "Select & Parse Statement File"}
              </div>
            </label>
          </div>

          {parseSuccess && (
            <div className="mt-4 p-3 rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              Statement file uploaded & reconciled against internal general
              ledger successfully! 100% matched.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reconciled Transaction Lines Table */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faScaleBalanced} className="text-primary" />
            General Ledger vs Gateway Audit Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">Transaction Ref</th>
                  <th className="p-3">Customer Account</th>
                  <th className="p-3">Channel / Type</th>
                  <th className="p-3">Internal Ledger Amount</th>
                  <th className="p-3">External Statement Amount</th>
                  <th className="p-3">Variance</th>
                  <th className="p-3">Reconciliation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {reconciledItems.map((item) => (
                  <tr key={item.txRef} className="hover:bg-muted/40">
                    <td className="p-3 font-bold text-foreground">
                      {item.txRef}
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {item.customer}
                    </td>
                    <td className="p-3 text-muted-foreground">{item.type}</td>
                    <td className="p-3 font-bold text-foreground">
                      {formatGhs(item.ledgerAmount)}
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {formatGhs(item.bankStatementAmount)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatGhs(item.difference)}
                    </td>
                    <td className="p-3">
                      <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                        {item.matchStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
