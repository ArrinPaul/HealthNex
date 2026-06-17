"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

export default function SupportTicketsList() {
  const tickets = useQuery(api.support.getTickets);

  if (!tickets) {
    return <div className="text-muted-foreground">Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground text-sm">
        No support tickets found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Support Tickets</h2>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
            <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{ticket.subject}</h4>
                  <p className="text-xs text-muted-foreground">ID: {ticket._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  ticket.status === 'open' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {ticket.status}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  ticket.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-secondary text-muted-foreground'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="p-5 grid md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-3 text-sm">
                 <div>
                    <p className="text-xs text-muted-foreground mb-1">From</p>
                    <p className="font-medium">{ticket.name}</p>
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-primary text-sm">{ticket.email}</p>
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="text-sm">{format(ticket.createdAt, 'MMM d, yyyy')}</p>
                 </div>
              </div>
              <div className="md:col-span-3">
                 <p className="text-xs text-muted-foreground mb-2">Message</p>
                 <div className="p-4 rounded-xl bg-secondary border border-border text-sm leading-relaxed whitespace-pre-wrap">
                    {ticket.message}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
