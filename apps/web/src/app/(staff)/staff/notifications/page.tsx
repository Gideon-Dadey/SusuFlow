"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faCommentSms,
  faCheckCircle,
  faClock,
  faUsers,
  faBan,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffNotificationsPage() {
  const [recipientGroup, setRecipientGroup] = useState("all");
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "both">("both");
  const [messageText, setMessageText] = useState(
    "Dear Customer, your daily Susu collection has been credited successfully. Thank you for saving with ADIPA Microfinance!",
  );
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [dispatchLogs, setDispatchLogs] = useState([
    {
      id: "LOG-9081",
      customer: "Ruiping Ding (WLQDQ6WL)",
      phone: "+233 24 123 4567",
      type: "Deposit Receipt",
      channel: "SMS & WhatsApp",
      content:
        "GH₵1,000.00 deposited via Mobile Money. New wallet balance: GH₵4,000.00.",
      status: "Delivered",
      time: "28 Jul 2026, 9:51 PM",
    },
    {
      id: "LOG-9080",
      customer: "Kwame Mensah (7X9K2M4W)",
      phone: "+233 50 987 6543",
      type: "Weekly Balance Summary",
      channel: "WhatsApp",
      content:
        "Your total Susu savings balance is GH₵500.00. Keep up the good work!",
      status: "Delivered",
      time: "28 Jul 2026, 8:15 PM",
    },
    {
      id: "LOG-9079",
      customer: "Ama Serwaa (9X3A7K5P)",
      phone: "+233 20 456 7890",
      type: "Deposit Receipt",
      channel: "SMS",
      content: "GH₵750.00 deposited. New wallet balance: GH₵1,850.00.",
      status: "Delivered",
      time: "28 Jul 2026, 6:30 PM",
    },
  ]);

  const handleSendBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setDispatchLogs((prev) => [
        {
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: "Bulk Broadcast (All Active Customers)",
          phone: "+233 (Multiple Recipients)",
          type: "Broadcast Message",
          channel:
            channel === "both" ? "SMS & WhatsApp" : channel.toUpperCase(),
          content: messageText,
          status: "Delivered",
          time: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      setTimeout(() => setSendSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">SMS & WhatsApp</h1>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Messages Dispatched
            </span>
            <p className="text-3xl font-bold font-mono text-primary mt-1">
              1,428
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              99.8% Delivery Rate
            </span>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Active Channels
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                Hubtel SMS
              </Badge>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                WhatsApp API
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
              Instant Gateway Connected
            </span>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Automated Triggers
            </span>
            <p className="text-3xl font-bold font-mono text-indigo-400 mt-1">
              Active
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
              Deposit & Withdrawal Instant Receipts
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FontAwesomeIcon icon={faPaperPlane} className="text-primary" />
              Broadcast Dispatcher
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSendBulk} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Target Audience
                </label>
                <select
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-none border border-border bg-card text-foreground"
                >
                  <option value="all">All Registered Customers</option>
                  <option value="active">Active Susu Savers Only</option>
                  <option value="pending">Pending KYC Customers</option>
                  <option value="collectors">Field Collectors</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "both", label: "SMS & WA" },
                    { id: "sms", label: "SMS Only" },
                    { id: "whatsapp", label: "WhatsApp" },
                  ].map((ch) => (
                    <Button
                      key={ch.id}
                      type="button"
                      variant={channel === ch.id ? "primary" : "outline"}
                      size="sm"
                      className="text-xs font-mono"
                      onClick={() => setChannel(ch.id as any)}
                    >
                      {ch.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 text-xs rounded-none border border-border bg-card text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Type announcement message..."
                />
              </div>

              {sendSuccess && (
                <div className="p-3 rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Message broadcast dispatched successfully to recipients!
                </div>
              )}

              <Button
                type="submit"
                disabled={isSending}
                className="w-full text-xs font-bold bg-primary text-primary-foreground"
              >
                {isSending ? "Sending Broadcast..." : "Dispatch Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Live Dispatch Log */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FontAwesomeIcon icon={faCommentSms} className="text-primary" />
              Live Gateway Dispatch Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3">Log Ref</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Content</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {dispatchLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/40">
                      <td className="p-3 font-bold text-foreground">
                        {log.id}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-foreground block">
                          {log.customer}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {log.phone}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.type}</td>
                      <td className="p-3 font-semibold text-primary">
                        {log.channel}
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-muted-foreground">
                        {log.content}
                      </td>
                      <td className="p-3">
                        <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-[10px] text-muted-foreground">
                        {log.time}
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
  );
}
