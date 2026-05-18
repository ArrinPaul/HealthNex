"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MessageSquare, Clock, AlertTriangle } from "lucide-react";

export default function SupportTicketsList() {
  const tickets = useQuery(api.support.getTickets);

  if (!tickets) {
    return <div className="text-muted-foreground">Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No support tickets found in the protocol.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight mt-10">High-Priority Tickets</h2>
      <div className="grid gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket._id} className="overflow-hidden hover:border-primary/40 transition-colors shadow-lg">
            <CardHeader className="bg-[var(--surface-2)]/50 border-b border-[var(--border-soft)] py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                      Protocol ID: {ticket._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} className="uppercase tracking-widest text-[9px] font-bold">
                    {ticket.status}
                  </Badge>
                  <Badge variant="destructive" className="uppercase tracking-widest text-[9px] font-bold">
                    {ticket.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sender</p>
                      <p className="font-bold">{ticket.name}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</p>
                      <div className="flex items-center gap-2 text-primary font-medium text-sm">
                         <Mail className="w-3 h-3" />
                         {ticket.email}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transmitted</p>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                         <Clock className="w-3 h-3" />
                         {format(ticket.createdAt, 'MMM d, p')}
                      </div>
                   </div>
                </div>
                <div className="md:col-span-3">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Transmission Payload</p>
                   <div className="p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] text-sm leading-relaxed whitespace-pre-wrap">
                      {ticket.message}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
