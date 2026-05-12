"use client";

import { useState } from 'react';
// import { useTranslation } from 'react-i18next'; // Removed for SSR compatibility
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HelpCircle, MessageCircle, Phone, Mail, Send } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function HelpPage() {
  // const { t } = useTranslation(); // Removed for SSR compatibility  
  const t = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
    setTimeout(() => {
      setLoading(false);
      alert('Your message has been sent! We will respond within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const faqs = [
    {
      question: 'How do I report a health issue?',
      answer: 'Navigate to the Community Reports page and fill out the form with details about the health issue. You can include your location, symptoms, and upload photos if needed. You can submit anonymously if you prefer.'
    },
    {
      question: 'How accurate are the outbreak predictions?',
      answer: 'Our AI models use historical data, weather patterns, and current disease trends to predict outbreaks. While not 100% accurate, they provide valuable early warnings that help health officials take preventive measures.'
    },
    {
      question: 'What should I do if I receive a water quality alert?',
      answer: 'If you receive a water quality alert, avoid consuming water from the affected source. Boil water for at least 20 minutes before use, or use bottled water. Follow the recommendations provided in the alert message.'
    },
    {
      question: 'How do I change the app language?',
      answer: 'Go to Settings page and select your preferred language from the Language dropdown. The application supports English, Hindi, and Assamese.'
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Yes! The app works offline for data collection. Your reports will be saved locally and automatically synced when you reconnect to the internet.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Visit the Profile page, click "Edit Profile", make your changes, and click Save. You can update your name, location, phone number, and password.'
    },
    {
      question: 'Who can access the health data I submit?',
      answer: 'Only authorized health officials and workers can access submitted health data. All personal information is kept confidential and used solely for disease surveillance and prevention purposes.'
    },
    {
      question: 'How often is the water quality data updated?',
      answer: 'Water quality data is updated daily using environmental parameters from weather APIs and available water quality databases. Real-time monitoring is performed for critical parameters.'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">{t('help')}</h1>
          <p className="text-muted-foreground mt-2">
            Get assistance and find answers to common questions
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-card/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-2">24/7 Support</p>
              <p className="text-lg font-bold">1800-XXX-XXXX</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-2">Response within 24h</p>
              <p className="text-sm font-medium">support@health.gov.in</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/50 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-2">Chat with support</p>
              <Button size="sm" variant="outline" className="mt-1">Start Chat</Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="backdrop-blur-xl bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="backdrop-blur-xl bg-card/50">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="mt-1"
                  rows={5}
                  placeholder="Describe your issue or question..."
                />
              </div>

              <Button type="submit" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? t('loading') : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Emergency Information */}
        <Card className="backdrop-blur-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Emergency Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-1">Medical Emergency</p>
                <p className="text-2xl font-bold text-red-600">108</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Health Helpline</p>
                <p className="text-2xl font-bold text-red-600">104</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Women & Child Helpline</p>
                <p className="text-2xl font-bold text-red-600">1098</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Disaster Management</p>
                <p className="text-2xl font-bold text-red-600">108</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}