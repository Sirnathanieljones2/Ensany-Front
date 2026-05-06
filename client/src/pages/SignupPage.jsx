import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  FileSignature,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { Button, Card, Input, Label } from "../components/ui/Base.jsx";

const steps = ["account", "verify", "consent", "profile"];

const initialSignup = {
  email: "",
  password: "",
  displayName: "",
  pendingSignupId: "",
  signupToken: "",
  devVerificationCode: "",
  verificationCode: "",
  consentAccepted: false,
  electronicSignature: "",
  profile: {
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    birthYear: "",
    notes: "",
  },
};

export function SignupPage() {
  const { auth, setAuth, t } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState("account");
  const [state, setState] = useState(initialSignup);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const currentIndex = steps.indexOf(step);

  const stepCopy = {
    account: {
      ...t.signup.steps.account,
      icon: LockKeyhole,
    },
    verify: {
      ...t.signup.steps.verify,
      icon: Mail,
    },
    consent: {
      ...t.signup.steps.consent,
      icon: FileSignature,
    },
    profile: {
      ...t.signup.steps.profile,
      icon: BadgeCheck,
    },
  };

  const current = stepCopy[step];
  const Icon = current.icon;

  const trustedLine = useMemo(() => {
    if (step === "account") return t.signup.trustedLine.account;
    if (step === "verify") return t.signup.trustedLine.verify + (state.email || "protocol_address");
    if (step === "consent") return t.signup.trustedLine.consent;
    return t.signup.trustedLine.profile;
  }, [state.email, step, t]);

  if (auth) return <Navigate to="/app/dashboard" replace />;

  function update(field, value) {
    setState((currentState) => ({ ...currentState, [field]: value }));
    setError("");
  }

  function updateProfile(field, value) {
    setState((currentState) => ({
      ...currentState,
      profile: { ...currentState.profile, [field]: value },
    }));
    setError("");
  }

  function goBack() {
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  }

  async function start(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api("/api/auth/signup/start", {
        method: "POST",
        body: JSON.stringify({
          email: state.email,
          password: state.password,
          displayName: state.displayName,
        }),
      });
      setState((currentState) => ({
        ...currentState,
        pendingSignupId: result.pendingSignupId,
        devVerificationCode: result.devVerificationCode ?? "",
      }));
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api("/api/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({
          pendingSignupId: state.pendingSignupId,
          code: state.verificationCode,
        }),
      });
      setState((currentState) => ({ ...currentState, signupToken: result.signupToken }));
      setStep("consent");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function acceptConsent(event) {
    event.preventDefault();
    if (!state.consentAccepted) {
      setError("Authorization is required to proceed with identity protection.");
      return;
    }
    if (!state.electronicSignature.trim()) {
      setError("Type your full legal name as a signature.");
      return;
    }
    setError("");
    setStep("profile");
  }

  async function complete(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api("/api/auth/signup/complete", {
        method: "POST",
        body: JSON.stringify({
          pendingSignupId: state.pendingSignupId,
          signupToken: state.signupToken,
          consent: {
            removalAuthorization: true,
            electronicSignature: state.electronicSignature,
          },
          profile: {
            ...state.profile,
            birthYear: state.profile.birthYear ? Number(state.profile.birthYear) : undefined,
          },
        }),
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
    <div className="flex-1 bg-[var(--bg-paper)] lg:grid lg:grid-cols-[1fr,560px]">
      {/* Editorial Column */}
      <div className="hidden lg:flex flex-col justify-center p-20 bg-white border-e border-[var(--border-subtle)] relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-4 block">
              {current.kicker}
            </span>
            <h1 className="text-5xl font-serif text-[var(--ink-main)] leading-tight mb-8">
              {current.title}
            </h1>
            <p className="text-lg text-[var(--ink-muted)] leading-relaxed mb-12">
              {current.text}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-white border border-[var(--border-subtle)] rounded-[var(--radius)]">
                <div className="w-12 h-12 flex items-center justify-center rounded-[var(--radius)] bg-[var(--bg-paper)] text-[var(--accent)] border border-[var(--border-subtle)]">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink-main)] uppercase tracking-wide">{t.signup.secureFileAccess}</h3>
                  <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-widest">{t.signup.protocolIntake}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-6 bg-[var(--accent-soft)] border border-[var(--accent-line)] rounded-[var(--radius)]">
                <ShieldCheck size={20} className="text-[var(--accent)] mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink-main)]">{trustedLine}</h3>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed mt-1">{current.aside}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "The Desk" Form Column */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-16">
        <Card className="w-full max-w-[480px] p-8 lg:p-12 bg-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 flex items-center justify-center rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--ink-faint)]">{t.signup.record} {currentIndex + 1} / {steps.length}</p>
              <h2 className="text-xl font-serif text-[var(--ink-main)]">{current.kicker}</h2>
            </div>
          </div>

          <div className="h-1 bg-[var(--bg-paper)] rounded-full mb-10 overflow-hidden border border-[var(--border-subtle)]">
            <div 
              className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          {step === "account" && (
            <form className="space-y-6" onSubmit={start}>
              <div className="space-y-4">
                <div>
                  <Label>{t.auth.displayName}</Label>
                  <Input placeholder={t.auth.displayName} value={state.displayName} onChange={(event) => update("displayName", event.target.value)} />
                </div>
                <div>
                  <Label>{t.auth.email}</Label>
                  <Input autoComplete="email" placeholder="you@example.com" type="email" value={state.email} onChange={(event) => update("email", event.target.value)} />
                </div>
                <div>
                  <Label>{t.auth.password}</Label>
                  <Input autoComplete="new-password" placeholder="At least 10 characters" type="password" value={state.password} onChange={(event) => update("password", event.target.value)} />
                </div>
              </div>
              {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-[var(--radius)] border border-red-100 uppercase">{error}</p>}
              <Button className="w-full" size="md" isLoading={loading}>
                {t.auth.submitCreate}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form className="space-y-6" onSubmit={verify}>
              <div className="bg-[var(--accent-soft)] border border-[var(--accent-line)] p-4 rounded-[var(--radius)] text-xs text-[var(--ink-muted)] leading-relaxed">
                <p>{t.signup.steps.verify.text}</p>
              </div>
              
              {state.devVerificationCode && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-[var(--radius)] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">{t.signup.sandboxCode}</span>
                  <strong className="text-xl font-mono tracking-[0.5em] text-amber-900 ml-2">{state.devVerificationCode}</strong>
                </div>
              )}

              <div>
                <Label>{t.signup.verificationToken}</Label>
                <Input 
                  className="text-center text-2xl font-mono font-black tracking-[0.5em] focus:tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-base" 
                  inputMode="numeric" 
                  maxLength={6} 
                  placeholder="000000" 
                  value={state.verificationCode} 
                  onChange={(event) => update("verificationCode", event.target.value.replace(/\D/g, ""))} 
                />
              </div>

              {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-[var(--radius)] border border-red-100 uppercase">{error}</p>}
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={goBack} className="shrink-0 px-4">
                  <ArrowLeft size={18} />
                </Button>
                <Button className="flex-1" size="md" isLoading={loading}>
                  {t.auth.submitCreate}
                </Button>
              </div>
            </form>
          )}

          {step === "consent" && (
            <form className="space-y-6" onSubmit={acceptConsent}>
              <div className="bg-[var(--bg-paper)] border border-[var(--border-subtle)] p-6 rounded-[var(--radius)] space-y-4">
                <h3 className="text-sm font-serif text-[var(--ink-main)] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[var(--accent)]" />
                  {t.signup.removalMandate}
                </h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed italic font-serif">
                  {t.signup.mandateText}
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded-none border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer" 
                  checked={state.consentAccepted} 
                  onChange={(event) => update("consentAccepted", event.target.checked)} 
                />
                <span className="text-xs font-bold text-[var(--ink-muted)] group-hover:text-[var(--ink-main)] transition-colors uppercase tracking-tight">
                  {t.signup.grantAuthority}
                </span>
              </label>

              <div>
                <Label>{t.signup.legalIdentity}</Label>
                <Input placeholder={t.signup.identityPlaceholder} value={state.electronicSignature} onChange={(event) => update("electronicSignature", event.target.value)} />
              </div>

              {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-[var(--radius)] border border-red-100 uppercase">{error}</p>}
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={goBack} className="shrink-0 px-4">
                  <ArrowLeft size={18} />
                </Button>
                <Button className="flex-1" size="md">
                  {t.signup.establishMandate}
                </Button>
              </div>
            </form>
          )}

          {step === "profile" && (
            <form className="space-y-6" onSubmit={complete}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>{t.signup.legalIdentity}</Label>
                  <Input autoComplete="name" placeholder={t.signup.identityPlaceholder} value={state.profile.fullName} onChange={(event) => updateProfile("fullName", event.target.value)} />
                </div>
                <div>
                  <Label>{t.signup.contactVector}</Label>
                  <Input autoComplete="tel" placeholder="+20..." value={state.profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} />
                </div>
                <div>
                  <Label>{t.signup.birthYear}</Label>
                  <Input inputMode="numeric" placeholder="YYYY" value={state.profile.birthYear} onChange={(event) => updateProfile("birthYear", event.target.value.replace(/\D/g, ""))} />
                </div>
                <div className="col-span-2">
                  <Label>{t.signup.domicile}</Label>
                  <Input autoComplete="street-address" placeholder="Street, building, area" value={state.profile.address} onChange={(event) => updateProfile("address", event.target.value)} />
                </div>
                <div>
                  <Label>{t.auth.city}</Label>
                  <Input autoComplete="address-level2" placeholder={t.auth.city} value={state.profile.city} onChange={(event) => updateProfile("city", event.target.value)} />
                </div>
                <div>
                  <Label>{t.auth.country}</Label>
                  <Input autoComplete="country-name" placeholder={t.auth.country} value={state.profile.country} onChange={(event) => updateProfile("country", event.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>{t.signup.matchingSignals}</Label>
                  <textarea 
                    className="w-full p-4 bg-white border border-[var(--border-subtle)] rounded-[var(--radius)] outline-none focus:border-[var(--ink-main)] focus:ring-4 focus:ring-black/5 min-h-[100px] text-xs font-sans"
                    placeholder={t.signup.matchingPlaceholder} 
                    value={state.profile.notes} 
                    onChange={(event) => updateProfile("notes", event.target.value)} 
                  />
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-[var(--radius)] border border-red-100 uppercase">{error}</p>}
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={goBack} className="shrink-0 px-4">
                  <ArrowLeft size={18} />
                </Button>
                <Button className="flex-1" size="md" isLoading={loading}>
                  {t.signup.finalizeIntake}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-dashed border-[var(--border-subtle)] text-center">
            <p className="text-xs text-[var(--ink-muted)]">
              {t.signup.alreadyHaveAccount} <Link to="/login" className="font-bold text-[var(--accent)] no-underline">{t.signup.accessDesk}</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
