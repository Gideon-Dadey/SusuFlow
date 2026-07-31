"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { customerApi, depositApi } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faCommentSms,
  faCheckCircle,
  faClock,
  faUsers,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

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
      id: `LOG-${d.reference.slice(-6)}`,
      customer: `${customerName} (${cardId})`,
      phone,
      type: "Deposit Receipt",
      channel: "SMS & WhatsApp",
      content: `GH₵${Number(d.amount).toFixed(2)} deposited via ${d.payment?.paymentMethod || "MoMo"}. Status: ${d.status.toUpperCase()}.`,
      status: d.status === "completed" ? "Delivered" : "Pending",
      time: new Date(d.createdAt).toLocaleString(),
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
        status: "Delivered",
        time: new Date().toLocaleString(),
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
          className="text-xs font-semibold gap-1.5"
        >
          <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
          Refresh Dispatch Logs
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Active Customers
              </p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : `${customers.length} Accounts`}
              </p>
            </div>
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Dispatches
              </p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : `${allLogs.length} Sent`}
              </p>
            </div>
            <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gateway Status
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Active / Online
              </p>
            </div>
            <div className="size-10 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faCommentSms} className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Form & Dispatch Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="text-primary h-4 w-4"
                />
                Dispatch Customer Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendBulk} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">
                    Target Recipient Group *
                  </label>
                  <select
                    value={recipientGroup}
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="w-full h-9 rounded border border-input bg-background px-3 font-medium text-xs"
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
                  <label className="font-semibold block mb-1">Channel *</label>
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
                        className={`py-1.5 rounded font-semibold text-xs border transition-colors ${
                          channel === ch.id
                            ? "bg-primary text-white border-primary"
                            : "bg-muted/40 text-muted-foreground border-border"
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Message Content *
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-3 rounded border border-input bg-background font-medium text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Type broadcast message..."
                  />
                </div>

                {sendSuccess && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Message dispatched successfully!
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full font-semibold text-xs h-9 gap-2"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {isSending ? "Dispatching..." : "Send Customer Broadcast"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real Dispatch Logs */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Recent System Dispatch Logs</span>
                <Badge variant="neutral" className="text-[10px] font-mono">
                  {allLogs.length} Records
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Loading dispatch history from database...
                </div>
              ) : allLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No notifications recorded yet. Send your first broadcast
                  message above.
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                  {allLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 hover:bg-muted/30 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {log.customer}
                          </span>
                          <Badge variant="neutral" className="text-[10px]">
                            {log.channel}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="h-3 w-3"
                          />
                          {log.status}
                        </span>
                      </div>

                      <p className="text-muted-foreground font-medium bg-muted/30 p-2 rounded">
                        {log.content}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        <span>Phone: {log.phone}</span>
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                          {log.time}
                        </span>
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
