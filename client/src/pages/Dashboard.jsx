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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-[#065f46] text-white font-black text-sm">E</span>
            <span className="font-bold text-[#0a0a0a] tracking-tight">Ensany</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink icon={LayoutDashboard} label="Overview" active href="#dashboard" />
          <SidebarLink icon={Inbox} label="Requests" href="#requests" />
          <SidebarLink icon={ShieldCheck} label="Profile" href="#profile" />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <SidebarLink icon={Settings} label="Settings" href="#settings" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-[#ecfdf5] text-[#065f46] flex items-center justify-center font-bold text-xs uppercase">
              {auth?.user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-[#0a0a0a] truncate">{auth?.user?.displayName}</p>
              <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Basic Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-8" id="dashboard">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">{t.dashboard.eyebrow}</span>
            <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-tight">{t.dashboard.title}</h1>
          </div>
          <Button 
            onClick={startRemoval} 
            disabled={starting || !profileReady || loading}
            isLoading={starting}
            size="lg"
            className="shadow-md shadow-[#065f46]/10"
          >
            {t.dashboard.start}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Readiness Card */}
        <Card className={`p-6 border-l-4 ${profileReady ? 'border-l-emerald-500 bg-emerald-50/30' : 'border-l-amber-500 bg-amber-50/30'}`} id="profile">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <Badge variant={profileReady ? "success" : "warning"} className="mb-2 uppercase tracking-wider">
                {profileReady ? "Ready" : "Action Required"}
              </Badge>
              <h2 className="text-xl font-bold text-[#0a0a0a]">
                {profileReady ? auth.user.profile.fullName : "Finish your removal profile"}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                {profileReady
                  ? `Ensany is ready to use your verified intake for broker removals in ${auth.user.profile.city}, ${auth.user.profile.country}.`
                  : `Before starting removals, we need your: ${missingProfileFields(auth?.user?.profile).join(", ")}.`}
              </p>
            </div>
            <Button variant={profileReady ? "secondary" : "primary"} as="a" href="#profile">
              {profileReady ? "View Profile" : "Complete Profile"}
            </Button>
          </div>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t.dashboard.requests} value={summary?.totalRequests ?? 0} icon={BarChart3} loading={loading} />
          <StatCard label={t.dashboard.sent} value={summary?.sent ?? 0} icon={MailCheck} loading={loading} />
          <StatCard label={t.dashboard.completed} value={summary?.completed ?? 0} icon={CheckCircle2} loading={loading} />
          <StatCard label={t.dashboard.needsAction} value={summary?.needsAction ?? 0} icon={Clock3} loading={loading} />
        </div>

        {/* Requests Table */}
        <div className="space-y-4" id="requests">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-[#0a0a0a] text-lg">Active Requests</h3>
            <Badge className="bg-gray-100 text-gray-500">{requests.length} total</Badge>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-12 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-50 rounded-md" />
                ))}
              </div>
            ) : requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-gray-400">{t.dashboard.broker}</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-gray-400">{t.dashboard.status}</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-gray-400">{t.dashboard.country}</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-gray-400">{t.dashboard.updated}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-4 font-bold text-[#0a0a0a]">{request.broker.name}</td>
                        <td className="p-4">
                          <Badge variant={getBadgeVariant(request.status)}>
                            {statusLabel(request.status)}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{request.broker.country}</td>
                        <td className="p-4 text-sm text-gray-400">{new Date(request.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center space-y-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Inbox size={32} />
                </div>
                <h4 className="font-bold text-[#0a0a0a]">No removal requests yet</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{t.dashboard.empty}</p>
                <div className="pt-4">
                  <Button variant="secondary" onClick={startRemoval} disabled={!profileReady}>Start your first run</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, href }) {
  return (
    <a 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md font-bold text-sm transition-all duration-200 
        ${active ? 'bg-emerald-50 text-[#065f46]' : 'text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50'}`}
    >
      <Icon size={18} className={active ? 'text-[#065f46]' : 'text-gray-400'} />
      {label}
    </a>
  );
}

function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between text-gray-400">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{label}</p>
        <p className={`text-3xl font-bold text-[#0a0a0a] ${loading ? 'animate-pulse text-gray-200' : ''}`}>
          {loading ? '---' : value}
        </p>
      </div>
    </Card>
  );
}

function getBadgeVariant(status) {
  if (status === 'COMPLETED') return 'success';
  if (['FAILED', 'REJECTED'].includes(status)) return 'danger';
  if (['EMAIL_SENT', 'IN_PROGRESS', 'FORM_SUBMITTED'].includes(status)) return 'warning';
  return 'neutral';
}
