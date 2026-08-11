"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatGhs, cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChartLine,
  faCoins,
  faScaleUnbalanced,
  faPiggyBank,
  faHistory,
  faCopy,
  faCheck,
  faRotateLeft,
  faDownload,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

type CalcTab = "keypad" | "compound" | "loan" | "liquidity" | "collector";

export default function StaffCalculatorPage() {
  const [activeTab, setActiveTab] = useState<CalcTab>("keypad");

  // -------------------------------------------------------------
  // 1. KEYPAD CALCULATOR STATE
  // -------------------------------------------------------------
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcExpression, setCalcExpression] = useState("");
  const [calcMemory, setCalcMemory] = useState<number>(0);
  const [calcHistory, setCalcHistory] = useState<
    { expression: string; result: string; time: string }[]
  >([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleKeyClick = (val: string) => {
    if (val === "C") {
      setCalcDisplay("0");
      setCalcExpression("");
    } else if (val === "CE") {
      setCalcDisplay("0");
    } else if (val === "DEL") {
      if (calcDisplay.length > 1) {
        setCalcDisplay(calcDisplay.slice(0, -1));
      } else {
        setCalcDisplay("0");
      }
    } else if (val === "=") {
      try {
        const sanitized = calcDisplay
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/%/g, "/100")
          .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)");

        // Safe evaluation
        const evalResult = Function(`"use strict"; return (${sanitized})`)();
        const formatted =
          typeof evalResult === "number" && !isNaN(evalResult)
            ? Number(evalResult.toFixed(4)).toString()
            : "Error";

        setCalcHistory((prev) => [
          {
            expression: calcDisplay,
            result: formatted,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 19),
        ]);

        setCalcExpression(`${calcDisplay} =`);
        setCalcDisplay(formatted);
      } catch {
        setCalcDisplay("Error");
      }
    } else if (val === "sqrt") {
      setCalcDisplay(`Math.sqrt(${calcDisplay})`);
    } else if (val === "M+") {
      const num = parseFloat(calcDisplay) || 0;
      setCalcMemory((prev) => prev + num);
    } else if (val === "M-") {
      const num = parseFloat(calcDisplay) || 0;
      setCalcMemory((prev) => prev - num);
    } else if (val === "MR") {
      setCalcDisplay(calcMemory.toString());
    } else if (val === "MC") {
      setCalcMemory(0);
    } else {
      if (calcDisplay === "0" && val !== ".") {
        setCalcDisplay(val);
      } else {
        setCalcDisplay((prev) => prev + val);
      }
    }
  };

  const copyHistoryResult = (result: string, idx: number) => {
    navigator.clipboard.writeText(result);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // -------------------------------------------------------------
  // 2. COMPOUND SAVINGS CALCULATOR STATE
  // -------------------------------------------------------------
  const [initDeposit, setInitDeposit] = useState<number | "">(1000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number | "">(200);
  const [annualRate, setAnnualRate] = useState<number | "">(12);
  const [savingsYears, setSavingsYears] = useState<number | "">(3);
  const [compoundFreq, setCompoundFreq] = useState<number>(12); // 12 = monthly

  const calculateCompoundSavings = () => {
    const numInit = Number(initDeposit) || 0;
    const numMonthly = Number(monthlyDeposit) || 0;
    const numRate = Number(annualRate) || 0;
    const numYears = Number(savingsYears) || 0;

    const r = numRate / 100 / compoundFreq;
    const t = numYears;
    const totalMonths = t * 12;

    let balance = numInit;
    let totalInvested = numInit;
    const schedule: {
      month: number;
      invested: number;
      balance: number;
      interest: number;
    }[] = [];

    for (let m = 1; m <= totalMonths; m++) {
      balance += numMonthly;
      totalInvested += numMonthly;
      const monthlyInterest = balance * (numRate / 100 / 12);
      balance += monthlyInterest;

      if (m % 12 === 0 || m === totalMonths) {
        schedule.push({
          month: m,
          invested: Math.round(totalInvested),
          balance: Math.round(balance),
          interest: Math.round(balance - totalInvested),
        });
      }
    }

    const totalInterest = balance - totalInvested;
    return {
      finalBalance: balance,
      totalInvested,
      totalInterest,
      schedule,
    };
  };

  const compoundResult = calculateCompoundSavings();

  // -------------------------------------------------------------
  // 3. LOAN & AMORTIZATION CALCULATOR STATE
  // -------------------------------------------------------------
  const [loanAmount, setLoanAmount] = useState<number | "">(5000);
  const [loanRate, setLoanRate] = useState<number | "">(18);
  const [loanMonths, setLoanMonths] = useState<number | "">(12);
  const [loanFreq, setLoanFreq] = useState<"monthly" | "weekly">("monthly");

  const calculateLoanAmortization = () => {
    const numLoan = Number(loanAmount) || 0;
    const numRate = Number(loanRate) || 0;
    const numMonths = Number(loanMonths) || 0;

    const periods =
      loanFreq === "monthly" ? numMonths : Math.round(numMonths * 4.33);
    const ratePerPeriod =
      loanFreq === "monthly" ? numRate / 100 / 12 : numRate / 100 / 52;

    let installment = 0;
    if (ratePerPeriod > 0) {
      installment =
        (numLoan * (ratePerPeriod * Math.pow(1 + ratePerPeriod, periods))) /
        (Math.pow(1 + ratePerPeriod, periods) - 1);
    } else {
      installment = periods > 0 ? numLoan / periods : 0;
    }

    let remaining = numLoan;
    const schedule: {
      period: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }[] = [];

    for (let p = 1; p <= periods; p++) {
      const interestPart = remaining * ratePerPeriod;
      const principalPart = installment - interestPart;
      remaining = Math.max(0, remaining - principalPart);

      if (p <= 12 || p === periods) {
        schedule.push({
          period: p,
          payment: installment,
          principal: principalPart,
          interest: interestPart,
          balance: remaining,
        });
      }
    }

    const totalRepay = installment * periods;
    const totalInterest = totalRepay - numLoan;

    return {
      installment,
      totalRepay,
      totalInterest,
      periods,
      schedule,
    };
  };

  const loanResult = calculateLoanAmortization();

  // -------------------------------------------------------------
  // 4. LIQUIDITY & RESERVE RATIO CALCULATOR STATE
  // -------------------------------------------------------------
  const [totalDeposits, setTotalDeposits] = useState<number | "">(250000);
  const [requiredReservePct, setRequiredReservePct] = useState<number | "">(15);
  const [vaultCash, setVaultCash] = useState<number | "">(45000);

  const calculateLiquidity = () => {
    const numDeposits = Number(totalDeposits) || 0;
    const numReservePct = Number(requiredReservePct) || 0;
    const numVault = Number(vaultCash) || 0;

    const requiredAmount = (numDeposits * numReservePct) / 100;
    const surplusOrDeficit = numVault - requiredAmount;
    const currentRatio = (numVault / (numDeposits || 1)) * 100;
    return {
      requiredAmount,
      surplusOrDeficit,
      currentRatio,
      isHealthy: numVault >= requiredAmount,
    };
  };

  const liquidityResult = calculateLiquidity();

  // -------------------------------------------------------------
  // 5. COLLECTOR DAILY YIELD CALCULATOR STATE
  // -------------------------------------------------------------
  const [collectorCount, setCollectorCount] = useState<number | "">(5);
  const [custPerCollector, setCustPerCollector] = useState<number | "">(40);
  const [avgDailySavings, setAvgDailySavings] = useState<number | "">(25);
  const [commissionPct, setCommissionPct] = useState<number | "">(3);

  const calculateCollectorYield = () => {
    const numCollectors = Number(collectorCount) || 0;
    const numCust = Number(custPerCollector) || 0;
    const numSavings = Number(avgDailySavings) || 0;
    const numCommPct = Number(commissionPct) || 0;

    const totalCustomers = numCollectors * numCust;
    const dailyVolume = totalCustomers * numSavings;
    const monthlyVolume = dailyVolume * 26; // 26 working days
    const totalCommission = (monthlyVolume * numCommPct) / 100;
    const netMfiRevenue = monthlyVolume - totalCommission;

    return {
      totalCustomers,
      dailyVolume,
      monthlyVolume,
      totalCommission,
      netMfiRevenue,
    };
  };

  const yieldResult = calculateCollectorYield();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">Financial & Accounting Suite</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="company-filter-tabs overflow-x-auto">
        {[
          { id: "keypad", label: "Smart Keypad", icon: faCalculator },
          { id: "compound", label: "Compound Growth", icon: faChartLine },
          { id: "loan", label: "Loan Amortization", icon: faScaleUnbalanced },
          { id: "liquidity", label: "Reserve & Liquidity", icon: faPiggyBank },
          { id: "collector", label: "Collector Yield", icon: faCoins },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as CalcTab)}
            className={cn(
              "company-filter-tab",
              activeTab === tab.id && "is-active",
            )}
          >
            <FontAwesomeIcon icon={tab.icon} className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SMART KEYPAD */}
      {activeTab === "keypad" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                  Scientific Keypad
                </CardTitle>
                {calcMemory !== 0 && (
                  <Badge
                    variant="info"
                    className="text-xs font-mono rounded-none"
                  >
                    Memory: {calcMemory}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Display Screen */}
              <div className="rounded-xl border border-border bg-slate-950 p-4 text-right shadow-inner">
                <div className="text-xs text-muted-foreground font-mono h-5 overflow-x-auto">
                  {calcExpression}
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tracking-tight overflow-x-auto py-1">
                  {calcDisplay}
                </div>
              </div>

              {/* Memory Row */}
              <div className="grid grid-cols-4 gap-2">
                {["MC", "MR", "M+", "M-"].map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs font-mono font-semibold"
                    onClick={() => handleKeyClick(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>

              {/* Main Keypad Grid */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "C", variant: "destructive" },
                  { label: "CE", variant: "outline" },
                  { label: "DEL", variant: "outline" },
                  { label: "÷", variant: "default" },
                  { label: "7" },
                  { label: "8" },
                  { label: "9" },
                  { label: "×", variant: "default" },
                  { label: "4" },
                  { label: "5" },
                  { label: "6" },
                  { label: "-", variant: "default" },
                  { label: "1" },
                  { label: "2" },
                  { label: "3" },
                  { label: "+", variant: "default" },
                  { label: "(" },
                  { label: "0" },
                  { label: "." },
                  { label: "=", variant: "success" },
                ].map((k) => (
                  <Button
                    key={k.label}
                    type="button"
                    variant={(k.variant as any) || "outline"}
                    className={cn(
                      "h-12 text-lg font-mono font-bold transition-transform active:scale-95",
                      k.variant === "success" &&
                        "bg-emerald-600 hover:bg-emerald-700 text-white",
                      k.variant === "default" &&
                        "bg-primary text-primary-foreground",
                    )}
                    onClick={() => handleKeyClick(k.label)}
                  >
                    {k.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History Panel */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                  <FontAwesomeIcon
                    icon={faHistory}
                    className="h-3.5 w-3.5 text-muted-foreground"
                  />
                  Calculation Log
                </CardTitle>
                {calcHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-destructive h-7"
                    onClick={() => setCalcHistory([])}
                  >
                    Clear Log
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
              {calcHistory.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-10">
                  No calculations performed yet.
                </p>
              ) : (
                calcHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        {item.expression}
                      </div>
                      <div className="text-sm font-mono font-bold text-foreground">
                        {item.result}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Copy Result"
                        onClick={() => copyHistoryResult(item.result, idx)}
                      >
                        <FontAwesomeIcon
                          icon={copiedIdx === idx ? faCheck : faCopy}
                          className={cn(
                            "h-3 w-3",
                            copiedIdx === idx
                              ? "text-emerald-500"
                              : "text-muted-foreground",
                          )}
                        />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Load into Keypad"
                        onClick={() => setCalcDisplay(item.result)}
                      >
                        <FontAwesomeIcon
                          icon={faRotateLeft}
                          className="h-3 w-3 text-muted-foreground"
                        />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: COMPOUND SAVINGS */}
      {activeTab === "compound" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-primary" />
                Growth Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Initial Deposit (GHS)"
                type="number"
                value={initDeposit}
                onChange={(e) =>
                  setInitDeposit(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Monthly Contribution (GHS)"
                type="number"
                value={monthlyDeposit}
                onChange={(e) =>
                  setMonthlyDeposit(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Annual Interest Rate (%)"
                type="number"
                step="0.5"
                value={annualRate}
                onChange={(e) =>
                  setAnnualRate(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Savings Duration (Years)"
                type="number"
                value={savingsYears}
                onChange={(e) =>
                  setSavingsYears(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Total Deposited
                  </span>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">
                    {formatGhs(compoundResult.totalInvested)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Interest Earned
                  </span>
                  <p className="text-2xl font-bold font-mono text-emerald-500 mt-1">
                    +{formatGhs(compoundResult.totalInterest)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-indigo-500/10 border-indigo-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Final Maturity Value
                  </span>
                  <p className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {formatGhs(compoundResult.finalBalance)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Schedule Table */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FontAwesomeIcon icon={faTable} className="text-primary" />
                  Yearly Growth Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted text-muted-foreground font-semibold uppercase">
                      <tr>
                        <th className="p-3">Timeline</th>
                        <th className="p-3">Total Deposited</th>
                        <th className="p-3">Interest Accumulated</th>
                        <th className="p-3">End Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {compoundResult.schedule.map((row) => (
                        <tr
                          key={row.month}
                          className="hover:bg-muted/40 font-mono"
                        >
                          <td className="p-3 font-bold text-foreground">
                            Year {row.month / 12}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {formatGhs(row.invested)}
                          </td>
                          <td className="p-3 text-emerald-500 font-semibold">
                            +{formatGhs(row.interest)}
                          </td>
                          <td className="p-3 font-bold text-foreground">
                            {formatGhs(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: LOAN AMORTIZATION */}
      {activeTab === "loan" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faScaleUnbalanced}
                  className="text-primary"
                />
                Loan Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Loan Amount (GHS)"
                type="number"
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Annual Interest Rate (%)"
                type="number"
                step="0.5"
                value={loanRate}
                onChange={(e) =>
                  setLoanRate(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Loan Term (Months)"
                type="number"
                value={loanMonths}
                onChange={(e) =>
                  setLoanMonths(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Payment Frequency
                </label>
                <select
                  value={loanFreq}
                  onChange={(e) => setLoanFreq(e.target.value as any)}
                  className="w-full py-2 px-3 text-sm rounded-none border border-border bg-card text-foreground"
                >
                  <option value="monthly">Monthly Installments</option>
                  <option value="weekly">Weekly Installments</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {loanFreq === "monthly" ? "Monthly" : "Weekly"} Payment
                  </span>
                  <p className="text-2xl font-bold font-mono text-primary mt-1">
                    {formatGhs(loanResult.installment)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Total Interest Charge
                  </span>
                  <p className="text-2xl font-bold font-mono text-amber-500 mt-1">
                    {formatGhs(loanResult.totalInterest)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Total Repayment
                  </span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {formatGhs(loanResult.totalRepay)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Amortization Table */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FontAwesomeIcon icon={faTable} className="text-primary" />
                  Amortization Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted text-muted-foreground font-semibold uppercase">
                      <tr>
                        <th className="p-3">Period</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Principal</th>
                        <th className="p-3">Interest</th>
                        <th className="p-3">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {loanResult.schedule.map((row) => (
                        <tr key={row.period} className="hover:bg-muted/40">
                          <td className="p-3 font-bold text-foreground">
                            {loanFreq === "monthly" ? "Month" : "Week"}{" "}
                            {row.period}
                          </td>
                          <td className="p-3 text-foreground">
                            {formatGhs(row.payment)}
                          </td>
                          <td className="p-3 text-emerald-500">
                            {formatGhs(row.principal)}
                          </td>
                          <td className="p-3 text-amber-500">
                            {formatGhs(row.interest)}
                          </td>
                          <td className="p-3 font-bold text-foreground">
                            {formatGhs(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: LIQUIDITY & RESERVE RATIO */}
      {activeTab === "liquidity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faPiggyBank} className="text-primary" />
                Reserve Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Total Customer Deposits (GHS)"
                type="number"
                value={totalDeposits}
                onChange={(e) =>
                  setTotalDeposits(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Required Cash Reserve Ratio (%)"
                type="number"
                value={requiredReservePct}
                onChange={(e) =>
                  setRequiredReservePct(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Actual Cash & Vault Funds (GHS)"
                type="number"
                value={vaultCash}
                onChange={(e) =>
                  setVaultCash(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Mandatory Reserve ({requiredReservePct}%)
                  </span>
                  <p className="text-2xl font-bold font-mono text-primary mt-1">
                    {formatGhs(liquidityResult.requiredAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  liquidityResult.isHealthy
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30",
                )}
              >
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Reserve Margin / Surplus
                  </span>
                  <p
                    className={cn(
                      "text-2xl font-bold font-mono mt-1",
                      liquidityResult.isHealthy
                        ? "text-emerald-500"
                        : "text-red-500",
                    )}
                  >
                    {liquidityResult.surplusOrDeficit >= 0 ? "+" : ""}
                    {formatGhs(liquidityResult.surplusOrDeficit)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-indigo-500/10 border-indigo-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Liquidity Health Status
                  </span>
                  <div className="mt-2">
                    <Badge
                      className={cn(
                        "text-xs px-3 py-1 font-bold capitalize",
                        liquidityResult.isHealthy
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white",
                      )}
                    >
                      {liquidityResult.isHealthy
                        ? "Surplus Reserve"
                        : "Reserve Deficit"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COLLECTOR YIELD */}
      {activeTab === "collector" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faCoins} className="text-primary" />
                Collection Modeling
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Number of Active Field Collectors"
                type="number"
                value={collectorCount}
                onChange={(e) =>
                  setCollectorCount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Average Customers per Collector"
                type="number"
                value={custPerCollector}
                onChange={(e) =>
                  setCustPerCollector(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Average Daily Deposit per Customer (GHS)"
                type="number"
                value={avgDailySavings}
                onChange={(e) =>
                  setAvgDailySavings(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <Input
                label="Collector Commission Rate (%)"
                type="number"
                step="0.5"
                value={commissionPct}
                onChange={(e) =>
                  setCommissionPct(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Daily Expected Field Inflow
                  </span>
                  <p className="text-2xl font-bold font-mono text-primary mt-1">
                    {formatGhs(yieldResult.dailyVolume)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {yieldResult.totalCustomers} total customers
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Monthly Gross Collection Volume
                  </span>
                  <p className="text-2xl font-bold font-mono text-emerald-500 mt-1">
                    {formatGhs(yieldResult.monthlyVolume)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on 26 active collection days
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Total Collector Commissions ({commissionPct}%)
                  </span>
                  <p className="text-2xl font-bold font-mono text-amber-500 mt-1">
                    {formatGhs(yieldResult.totalCommission)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-indigo-500/10 border-indigo-500/30">
                <CardContent className="p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Net Company Revenue Inflow
                  </span>
                  <p className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {formatGhs(yieldResult.netMfiRevenue)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
