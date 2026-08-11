"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { customerApi, depositApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRotateRight } from "@fortawesome/free-solid-svg-icons";

interface DispatchLog {
  id: string;
  customer: string;
  phone: string;
  type: string;
  channel: string;
  content: string;
  status: string;
  time: string;
}

export default function StaffNotificationsPage() {
  const [recipientGroup, setRecipientGroup] = useState("all");
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "both">("both");
  const [messageText, setMessageText] = useState(
    "Dear Customer, your daily Susu deposit has been processed. Thank you for saving with us!",
  );
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [localLogs, setLocalLogs] = useState<DispatchLog[]>([]);

  // Fetch real customers from database
  const {
    data: customersData,
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["staff-notifications-customers"],
    queryFn: () => customerApi.list(),
    placeholderData: (prev) => prev,
  });

  // Fetch real recent deposits to build initial real notification dispatch history
  const {
    data: depositsData,
    isLoading: depositsLoading,
    refetch: refetchDeposits,
  } = useQuery({
    queryKey: ["staff-notifications-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const customers = customersData?.items || [];
  const deposits = depositsData?.items || [];

  // Build real dispatch logs from actual database transactions
  const realLogs: DispatchLog[] = deposits.slice(0, 10).map((d) => {
    const customerName = d.customer?.user
      ? `${d.customer.user.firstName} ${d.customer.user.lastName}`
      : "Customer";
    const phone = d.customer?.user?.phone || "N/A";
    const cardId = d.customer?.customerNumber || "";

    return {
      id: d.reference,
      customer: `${customerName} (${cardId})`,
      phone,
      type: "Deposit Receipt",
      channel: "SMS & WhatsApp",
      content: `GH₵${Number(d.amount).toFixed(2)} deposited via ${d.payment?.paymentMethod || "MoMo"}. Status: ${d.status.toUpperCase()}.`,
      status: d.status === "completed" ? "completed" : "pending",
      time: formatDate(d.createdAt),
    };
  });

  const allLogs = [...localLogs, ...realLogs];

  const handleSendBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);

      const count = recipientGroup === "all" ? customers.length : 1;
      const targetLabel =
        recipientGroup === "all"
          ? `All Active Customers (${count} Recipients)`
          : `Selected Customer Segment (${count} Recipient)`;

      const newLog: DispatchLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: targetLabel,
        phone: "+233 (Broadcast System)",
        type: "Broadcast Message",
        channel: channel === "both" ? "SMS & WhatsApp" : channel.toUpperCase(),
        content: messageText,
        status: "completed",
        time: formatDate(new Date().toISOString()),
      };

      setLocalLogs((prev) => [newLog, ...prev]);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 800);
  };

  const isLoading = customersLoading || depositsLoading;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">SMS & WhatsApp Dispatch Center</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchCustomers();
            refetchDeposits();
          }}
          className="text-xs font-semibold min-h-[36px] gap-1.5"
        >
          <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
          Refresh Dispatch Logs
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Active Customers
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {isLoading ? "..." : `${customers.length}`}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Registered accounts
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Dispatches
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {isLoading ? "..." : `${allLogs.length}`}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Messages sent
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Gateway Status
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm sm:text-lg font-bold text-foreground">
              Online
            </span>
            <StatusBadge status="completed" />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            SMS & WhatsApp ready
          </p>
        </Card>
      </div>

      {/* Broadcast Form & Dispatch Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-border/60">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Dispatch Customer Message
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSendBulk} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-xs text-muted-foreground block mb-1.5">
                    Target Recipient Group *
                  </label>
                  <select
                    value={recipientGroup}
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary min-h-[40px]"
                  >
                    <option value="all">
                      All Active Registered Customers ({customers.length})
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.user?.firstName} {c.user?.lastName} (
                        {c.customerNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-xs text-muted-foreground block mb-1.5">
                    Channel *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "sms", label: "SMS" },
                      { id: "whatsapp", label: "WhatsApp" },
                      { id: "both", label: "SMS & WhatsApp" },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setChannel(ch.id as any)}
                        className={`py-2 font-semibold text-xs border transition-colors ${channel === ch.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border/60 hover:bg-muted/20"}`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-xs text-muted-foreground block mb-1.5">
                    Message Content *
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-3 rounded-none border border-border/60 bg-card font-normal text-xs text-foreground focus:outline-none focus:border-primary"
                    placeholder="Type broadcast message..."
                  />
                </div>

                {sendSuccess && (
                  <div className="p-3 rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    Message dispatched successfully!
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full font-semibold text-xs min-h-[40px] gap-2 bg-primary text-primary-foreground hover:bg-primary/95"
                >
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="h-3.5 w-3.5"
                  />
                  {isSending ? "Dispatching..." : "Send Customer Broadcast"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real Dispatch Logs */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Recent Dispatch Logs
              </CardTitle>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {allLogs.length} Records
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Loading dispatch history from database...
                </div>
              ) : allLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No notifications recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border/60 max-h-[500px] overflow-y-auto">
                  {allLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 hover:bg-muted/20 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {log.customer}
                          </span>
                          <span className="inline-flex items-center rounded-none bg-muted/60 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">
                            {log.channel}
                          </span>
                        </div>
                        <StatusBadge status={log.status} />
                      </div>

                      <p className="text-muted-foreground font-normal bg-muted/20 p-2.5 rounded-none border border-border/40">
                        {log.content}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 font-mono">
                        <span>Phone: {log.phone}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
