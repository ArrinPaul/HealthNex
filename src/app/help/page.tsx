"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingLayout from '@/components/layout/LandingLayout';
import { 
  HelpCircle, MessageCircle, Phone, Mail, Send, 
  ChevronDown, Search, Book, Shield, Zap, LifeBuoy,
  Activity, Clock, AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-soft)] last:border-0 py-8">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left group">
        <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{question}</span>
        <div className={`w-10 h-10 rounded-full border border-[var(--border-soft)] flex items-center justify-center transition-all ${isOpen ? 'bg-primary border-primary text-white rotate-180 shadow-lg shadow-primary/20' : 'group-hover:border-primary group-hover:text-primary'}`}>
           <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <p className="pt-6 text-lg text-muted-foreground leading-relaxed max-w-4xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SystemStatusHUD = () => (
  <div className="p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-2xl relative overflow-hidden">
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_70%)] opacity-5" />
     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex items-center gap-6">
           <div className="relative">
              <Activity className="w-12 h-12 text-emerald-500" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
           </div>
           <div>
              <h4 className="text-xl font-bold tracking-tight">System Status</h4>
              <p className="text-emerald-500 font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 All Systems Operational
              </p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
           {[
             { label: 'Data Sync', value: 'Active' },
             { label: 'Cloud Latency', value: '42ms' },
             { label: 'Uptime', value: '99.99%' }
           ].map((item, i) => (
             <div key={i} className="space-y-1">
                <div className="text-lg font-bold text-foreground">{item.value}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</div>
             </div>
           ))}
        </div>
     </div>
  </div>
);

export default function HelpPage() {

  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit support ticket');
      }

      toast.success('Message Sent', {
        description: 'Your support ticket has been received by our team.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error('Sending Failed', {
        description: error?.message || 'Could not reach the support service. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: 'How do I report a health issue?',
      answer: 'Navigate to the Community Reports page and fill out the form with details about the health issue. You can include your location, symptoms, and upload photos if needed. You can submit anonymously if you prefer.'
    },
    {
      question: 'How accurate are the outbreak predictions?',
      answer: 'Our intelligence engine uses Gemini AI to analyze historical data, weather patterns, and current disease trends. While the models continuously recalibrate, they provide valuable early warnings for preventive regional measures.'
    },
    {
      question: 'What should I do if I receive a water quality alert?',
      answer: 'If you receive a water quality alert, avoid consuming water from the affected source. Follow the specific recommendations provided in the alert message and monitor for system updates.'
    },
    {
      question: 'How do I change the app language?',
      answer: 'Go to Settings page and select your preferred language from the Language dropdown. The application currently supports English, Hindi, and Bengali locales.'
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Yes. HealthNex is built as a progressive web app. It keeps a local data cache and automatically syncs all regional reports as soon as a secure connection is available.'
    }
  ];

  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <LifeBuoy className="w-3.5 h-3.5" />
              Support
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Help Center <br />
              <span className="text-primary">& Documentation</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
              Access technical resources, monitor system status, or reach out to our dedicated support team for assistance with HealthNex.
            </p>
          </motion.div>

          <div className="mb-24">
             <SystemStatusHUD />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {[
              { title: 'Call Support', desc: '24/7 dedicated helpline for urgent regional health alerts.', icon: Phone, action: '1800-123-4567', color: 'text-sky-400', bg: 'bg-sky-400/10' },
              { title: 'Email Desk', desc: 'Detailed inquiries and integration support. Response within 24h.', icon: Mail, action: 'support@healthnex.io', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { title: 'Live Chat', desc: 'Real-time chat support with our care team.', icon: MessageCircle, action: 'Start Chat', color: 'text-violet-400', bg: 'bg-violet-400/10' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-xl hover:border-primary/40 transition-all group text-center"
              >
                <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">{item.desc}</p>
                <div className="text-lg font-bold text-foreground mb-4">{item.action}</div>
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                   <span>Contact Now</span>
                   <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-32">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight">Common Inquiries</h2>
                  <p className="text-muted-foreground">Answers to the most frequent technical and operational questions.</p>
               </div>
               <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl p-10 md:p-14 shadow-xl">
                  {faqs.map((faq, i) => (
                    <FAQItem key={i} {...faq} />
                  ))}
               </div>
            </div>

            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight">Contact Support</h2>
                  <p className="text-muted-foreground">Submit a ticket and our support team will get back to you.</p>
               </div>
               <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl p-10 md:p-14 shadow-xl">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest ml-4">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-14 rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)] px-6"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest ml-4">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-14 rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)] px-6"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-widest ml-4">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Technical Inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="h-14 rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)] px-6"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest ml-4">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question in detail..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        className="rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)] p-6"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl font-semibold text-base bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                      {loading ? 'Sending...' : (
                        <span className="flex items-center gap-2">
                           Send Message <Send className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
               </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 md:p-20 rounded-3xl bg-gradient-to-br from-rose-500/10 to-amber-500/5 border border-rose-500/20 relative overflow-hidden text-center"
          >
             <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                   <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-rose-500">Emergency Contacts</h2>
                   <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Critical Regional Helplines</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   {[
                     { label: 'Medical Emergency', value: '108' },
                     { label: 'Health Helpline', value: '104' },
                     { label: 'Women & Child', value: '1098' },
                     { label: 'Disaster Mgmt', value: '108' }
                   ].map((item, i) => (
                     <div key={i} className="p-8 rounded-3xl bg-background/50 border border-rose-500/20 backdrop-blur-sm">
                        <div className="text-4xl font-bold text-rose-500 mb-2">{item.value}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
