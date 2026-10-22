import Link from 'next/link';
import LandingLayout from '@/components/layout/LandingLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, Database, Server, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | HealthNex',
  description: 'HealthNex Privacy Policy outlining data protection, security safeguards, and privacy rights under Indian data-protection law.',
};

export default function PrivacyPage() {
  return (
    <LandingLayout>
      <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient background glows */}
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left border-b border-border/60 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Privacy Policy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              HealthNex Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
              <span><strong>Effective Date:</strong> 23 October 2026</span>
              <span><strong>Version:</strong> 1.0</span>
              <span><strong>Jurisdiction:</strong> India (DPDP Act, 2023 & IT Act)</span>
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Security-First</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bcrypt password hashing (cost factor 12), signed HS256 JWT sessions, and private no-store cache headers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-sky-500/10 text-sky-500">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Anonymized Insights</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Community reports strip raw storage URLs. Direct identifiers are never sent to external AI providers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-violet-500/10 text-violet-500">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Durable Cleanup</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Failed blob deletions enter a durable queue with reference validation before file removal.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">1. Introduction & Mission</h2>
              <p>
                HealthNex is an open-source, community-driven disease surveillance and environmental health monitoring platform. 
                Our mission is to help local communities, verified healthcare professionals, and public health authorities detect 
                and respond to localized health risks and waterborne hazards while maintaining uncompromising standards of data privacy.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">2. Legal Framework & Indian Law</h2>
              <p>
                HealthNex operates in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)</strong> and the 
                <strong>Information Technology Act, 2000</strong> (including the SPDI Rules, 2011). We adhere strictly to the core principles of 
                purpose limitation, data minimization, cryptographic storage protection, and user rights.
              </p>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span>Regulatory Commencement Note</span>
                </div>
                <p>
                  While specific administrative rules and the Data Protection Board under the DPDP Act, 2023 await full operational notification 
                  by the Government of India, HealthNex has proactively implemented the required technical safeguards and purpose controls today.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">3. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Account Credentials:</strong> Full name, verified email, and salted bcrypt password hashes. 
                  Plaintext passwords are never stored or logged.
                </li>
                <li>
                  <strong className="text-foreground">Health Worker Verification Documents:</strong> Medical licenses or institutional IDs uploaded 
                  by applicants requesting the health worker role. These are stored in private storage, accessible only to administrators.
                </li>
                <li>
                  <strong className="text-foreground">Personal Health Vault Data:</strong> User-submitted vitals, symptoms, medications, and 
                  water quality test observations stored strictly in private, user-isolated records.
                </li>
                <li>
                  <strong className="text-foreground">Community Outbreak Reports:</strong> Disease observations, regional coordinates, severity, 
                  and optional photographic attachments. Raw storage identifiers are permanently sanitized from public views.
                </li>
                <li>
                  <strong className="text-foreground">Support Inquiries:</strong> Inquiries submitted through our rate-limited gateway (10 requests/hour/IP), 
                  protected by server-side secrets.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">4. AI Features & Diagnostic Safety</h2>
              <p>
                HealthNex integrates AI models (via Google Gemini and Groq) to provide contextual symptom analysis, outbreak forecasting, and health guidance.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Informational Guidance Only:</strong> AI outputs are not clinical diagnoses, medical advice, or prescriptions. Always consult a qualified medical professional for health concerns.
                </li>
                <li>
                  <strong>No Fabricated Diagnoses:</strong> When an external AI provider is unavailable, HealthNex returns an explicit 503 service status. We never return fabricated confidence scores or fallback synthetic diagnoses.
                </li>
                <li>
                  <strong>Identity Isolation:</strong> Direct personal identifiers (names, emails, passwords) are never transmitted to AI language model APIs.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">5. Third-Party Infrastructure</h2>
              <p>
                We do not sell, rent, monetize, or trade your data with advertising networks. Data processing is supported by:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border bg-card/40">
                  <span className="font-semibold text-foreground text-xs block mb-1">Convex Cloud</span>
                  <span className="text-xs">Database transactions and secure, access-controlled object storage.</span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/40">
                  <span className="font-semibold text-foreground text-xs block mb-1">Google Gemini & Groq APIs</span>
                  <span className="text-xs">Natural language processing of non-identifying health queries.</span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/40">
                  <span className="font-semibold text-foreground text-xs block mb-1">Open-Meteo & Nominatim</span>
                  <span className="text-xs">Geocoding and regional weather analytics without personal tracking.</span>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">6. Security Safeguards</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Cryptographic Tokens:</strong> Verified HS256 JWT tokens with HMAC-SHA256 signature enforcement.</li>
                <li><strong>Role-Based Access Control:</strong> Strict database-level isolation ensuring users access only their own records.</li>
                <li><strong>Cache-Control Enforcement:</strong> Sensitive APIs emit <code>private, no-store</code> headers to prevent downstream proxy caching.</li>
                <li><strong>Anti-IDOR Verification:</strong> Attachments are validated against cross-table references before linking or deletion.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">7. Data Retention & Deletion</h2>
              <p>
                Personal health vault data and community reports may be deleted directly by the user. Deletion triggers unlinking and 
                durable storage cleanup. Approved health-worker credentials remain retained for the active professional affiliation.
              </p>
              <p>
                Full operational retention lifecycles and recovery queue procedures are documented in our internal{' '}
                <Link href="/docs/DATA_RETENTION_POLICY.md" className="text-primary hover:underline font-medium">
                  Data Retention Policy
                </Link>.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">8. Your Privacy Rights</h2>
              <p>
                Under Indian data protection laws, you have the right to request access to your personal data, seek correction of inaccurate 
                records, request account erasure, and register privacy grievances with our desk.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3 border-t border-border/60 pt-6">
              <h2 className="text-xl font-bold text-foreground">9. Contact & Grievance Redressal</h2>
              <p>
                For questions, rights requests, or feedback regarding data privacy in HealthNex:
              </p>
              <div className="p-4 rounded-lg bg-card border border-border text-xs space-y-1">
                <p><strong className="text-foreground">Portal:</strong> Support Desk at <Link href="/help" className="text-primary hover:underline">/help</Link></p>
                <p><strong className="text-foreground">Role:</strong> Privacy & Compliance Communications Desk</p>
                <p><strong className="text-foreground">Project:</strong> HealthNex Open Source Health Intelligence Initiative</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
