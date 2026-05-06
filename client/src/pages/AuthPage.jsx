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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white border-b border-gray-100" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ecfdf5] rounded-full blur-[120px] opacity-60" />

      <div className="w-full max-w-[1000px] grid lg:grid-cols-[1fr,440px] gap-12 lg:gap-20 items-center relative z-10">
        <div className="animate-in fade-in slide-in-from-left-8 duration-700">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-[#065f46] text-white font-black text-sm">E</span>
            <span className="font-bold text-[#0a0a0a] tracking-tight text-lg">Ensany</span>
          </Link>
          
          <span className="text-xs font-bold tracking-wider uppercase text-[#065f46] mb-4 block">Secure access</span>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#0a0a0a] leading-[1.1] mb-8 tracking-tight">
            Return to your privacy workspace.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-lg mb-10">
            Sign in to review removal progress, operator notes, broker activity, and proof of follow-up.
          </p>

          <div className="flex gap-8">
            <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
              <ShieldCheck className="w-5 h-5 text-[#065f46]" />
              Data Encryption
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
              <Mail className="w-5 h-5 text-[#065f46]" />
              Verified Requests
            </div>
          </div>
        </div>

        <Card className="p-8 lg:p-10 shadow-2xl shadow-[#0a0a0a]/10 animate-in fade-in zoom-in-95 duration-500 bg-white/80 backdrop-blur-xl border-white/50">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#065f46] text-white shadow-lg shadow-[#065f46]/20">
              <KeyRound size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0a0a0a]">Welcome back</h2>
              <p className="text-sm text-gray-400 font-medium">Continue to your account</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submit}>
            <div className="space-y-4">
              <div>
                <Label>Email address</Label>
                <Input 
                  autoComplete="email" 
                  placeholder={t.auth.email} 
                  type="email" 
                  value={form.email} 
                  onChange={(event) => update("email", event.target.value)} 
                />
              </div>
              <div>
                <Label>Password</Label>
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
              <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100 animate-in shake duration-300">
                {error}
              </p>
            )}

            <Button className="w-full" size="lg" isLoading={loading}>
              {t.auth.submitLogin}
            </Button>

            <div className="text-center space-y-4 pt-4">
              <p className="text-sm text-gray-500">
                New to Ensany? <Link to="/signup" className="font-bold text-[#065f46] hover:underline">Create a protected account</Link>
              </p>
              <p className="text-xs text-gray-400">
                Protected by industry-standard encryption.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
