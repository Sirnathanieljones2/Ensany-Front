import { KeyRound, ShieldCheck, Mail } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { Button, Card, Input, Label } from "../components/ui/Base.jsx";

export function AuthPage() {
  const { auth, setAuth, t } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth) return <Navigate to="/app/dashboard" replace />;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("ensany_token", result.token);
      localStorage.setItem("ensany_user", JSON.stringify(result.user));
      setAuth(result);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] flex items-center justify-center p-6 lg:p-12 relative">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-[1fr,440px] gap-12 lg:gap-20 items-center">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-4 block">Secure Access Desk</span>
          <h1 className="text-5xl lg:text-6xl font-serif text-[var(--ink-main)] leading-[1.1] mb-8 tracking-tight">
            Return to your privacy workspace.
          </h1>
          <p className="text-lg text-[var(--ink-muted)] leading-relaxed max-w-lg mb-10">
            Sign in to review removal progress, operator notes, broker activity, and the verified chain of custody.
          </p>

          <div className="flex gap-8">
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-[var(--ink-faint)] tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              Secure_Auth
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-[var(--ink-faint)] tracking-widest uppercase">
              <Mail className="w-4 h-4 text-[var(--accent)]" />
              Verif_Link
            </div>
          </div>
        </div>

        <Card className="p-8 lg:p-12 bg-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
              <KeyRound size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[var(--ink-main)]">Access</h2>
              <p className="text-[10px] text-[var(--ink-faint)] font-mono uppercase tracking-widest">Protocol Required</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submit}>
            <div className="space-y-4">
              <div>
                <Label>Email Ident</Label>
                <Input 
                  autoComplete="email" 
                  placeholder={t.auth.email} 
                  type="email" 
                  value={form.email} 
                  onChange={(event) => update("email", event.target.value)} 
                />
              </div>
              <div>
                <Label>Auth Password</Label>
                <Input 
                  autoComplete="current-password" 
                  placeholder={t.auth.password} 
                  type="password" 
                  value={form.password} 
                  onChange={(event) => update("password", event.target.value)} 
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-[var(--radius)] border border-red-100 font-sans uppercase tracking-tight">
                {error}
              </p>
            )}

            <Button className="w-full" size="md" isLoading={loading}>
              Establish Connection
            </Button>

            <div className="text-center space-y-6 pt-6 border-t border-dashed border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--ink-muted)]">
                New to Ensany? <Link to="/signup" className="font-bold text-[var(--accent)] no-underline">Create Identity File</Link>
              </p>
              <div className="flex justify-center">
                <span className="text-[10px] text-[var(--ink-faint)] font-mono uppercase tracking-widest border border-[var(--border-subtle)] px-2 py-1">
                  AES-256-GCM Secure
                </span>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
