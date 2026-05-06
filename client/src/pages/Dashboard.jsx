import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Inbox, LayoutDashboard, MailCheck, Settings, ShieldCheck, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { isProfileComplete, missingProfileFields } from "../lib/profile.js";
import { Button, Card, Badge } from "../components/ui/Base.jsx";

export function Dashboard() {
  const { auth, statusLabel, t } = useApp();
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const profileReady = isProfileComplete(auth?.user?.profile);

  async function load() {
    setLoading(true);
    const [dashboardData, requestsData] = await Promise.all([api("/api/dashboard"), api("/api/removals")]);
    setDashboard(dashboardData);
    setRequests(requestsData.requests);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  async function startRemoval() {
    if (!profileReady) {
      setError("Complete and save your profile intake before starting removals.");
      return;
    }

    setStarting(true);
    setError("");
    try {
      await api("/api/removals/start", { method: "POST", body: "{}" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  const summary = dashboard?.summary;

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] flex">
      {/* Sidebar Navigation - Document Aesthetic */}
      <aside className="w-64 bg-white border-r border-[var(--border-subtle)] hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl text-[var(--accent)] tracking-tight">Ensany</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-1">
          <SidebarLink icon={LayoutDashboard} label="The Brief" active href="#dashboard" />
          <SidebarLink icon={Inbox} label="The Desk" href="#requests" />
          <SidebarLink icon={ShieldCheck} label="Identity File" href="#profile" />
          <div className="pt-6 mt-6 border-t border-[var(--border-subtle)]">
            <SidebarLink icon={Settings} label="Protocols" href="#settings" />
          </div>
        </nav>

        <div className="p-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs uppercase border border-[var(--accent-line)]">
              {auth?.user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-[var(--ink-main)] truncate font-sans uppercase tracking-wider">{auth?.user?.displayName}</p>
              <p className="text-[9px] text-[var(--ink-faint)] font-mono uppercase tracking-widest">Subscriber</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - "Private Desk" */}
      <main className="flex-1 p-8 lg:p-12 max-w-[1000px] w-full space-y-12" id="dashboard">
        {/* Page Header - Editorial Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-serif text-[var(--ink-main)]">{t.dashboard.title}</h1>
            <p className="text-[var(--ink-muted)] text-sm">We secured your profile across 3 new brokers overnight.</p>
          </div>
          <Button 
            onClick={startRemoval} 
            disabled={starting || !profileReady || loading}
            isLoading={starting}
            size="md"
          >
            {t.dashboard.start}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-[var(--radius)] flex gap-3 text-red-600 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Readiness Card - "The Intake" */}
        <Card className="p-8 border-l-4 border-l-[var(--accent)]" id="profile">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <Badge variant={profileReady ? "success" : "review"} className="mb-2">
                {profileReady ? "Verified" : "Action Needed"}
              </Badge>
              <h2 className="text-2xl font-serif text-[var(--ink-main)]">
                {profileReady ? "Your identity file is complete." : "Finish your identity intake."}
              </h2>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed max-w-2xl">
                {profileReady
                  ? `Ensany is authorized to use your verified credentials for broker removals in ${auth.user.profile.city}, ${auth.user.profile.country}.`
                  : `Before we can legally act on your behalf, we require: ${missingProfileFields(auth?.user?.profile).join(", ")}.`}
              </p>
            </div>
            <Button variant={profileReady ? "secondary" : "primary"} as="a" href="#profile" className="shrink-0">
              {profileReady ? "Review Intake" : "Complete File"}
            </Button>
          </div>
        </Card>

        {/* The Archive - Chain of Custody (Audit Trail) */}
        <div className="space-y-6" id="requests">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-[var(--ink-main)]">The Archive</h3>
            <p className="text-[10px] font-mono font-bold text-[var(--ink-faint)] uppercase tracking-widest">{requests.length} records</p>
          </div>

          <div className="audit-log">
            {loading ? (
              <div className="p-12 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="audit-item">
                  <div className="audit-time">
                    {new Date(request.updatedAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="audit-details">
                    <p className="text-sm font-medium">{statusLabel(request.status)}: {request.broker.name}</p>
                    <p className="audit-meta">REF: {request.id.split('-')[0].toUpperCase()} • LOC: {request.broker.country} • PARSED_SIGNAL: RTBF_EMA</p>
                  </div>
                  <div className="shrink-0">
                    <Badge variant={getBadgeVariant(request.status)}>
                      {request.status === 'COMPLETED' ? 'Verified' : request.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--bg-paper)] rounded-[var(--radius)] flex items-center justify-center mx-auto text-[var(--ink-faint)] border border-dashed border-[var(--border-subtle)]">
                  <Inbox size={24} />
                </div>
                <h4 className="font-serif text-lg text-[var(--ink-main)]">The Archive is currently empty.</h4>
                <p className="text-xs text-[var(--ink-muted)] max-w-xs mx-auto leading-relaxed">No removal requests have been initiated under your current protocols.</p>
                <div className="pt-2">
                  <Button variant="secondary" onClick={startRemoval} disabled={!profileReady} size="sm">Initiate First Removal</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, href }) {
  return (
    <a 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] font-sans text-xs font-bold tracking-wide uppercase transition-all duration-300 
        ${active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-paper)]'}`}
    >
      <Icon size={16} className={active ? 'text-[var(--accent)]' : 'text-[var(--ink-faint)]'} />
      {label}
    </a>
  );
}

function getBadgeVariant(status) {
  if (status === 'COMPLETED') return 'success';
  if (['FAILED', 'REJECTED'].includes(status)) return 'danger';
  if (['EMAIL_SENT', 'IN_PROGRESS', 'FORM_SUBMITTED'].includes(status)) return 'review';
  return 'neutral';
}
