import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { Button, Card, Input, Label } from "../components/ui/Base.jsx";

const steps = ["account", "verify", "consent", "profile"];

const stepCopy = {
  account: {
    kicker: "Secure account",
    title: "Start with the account we will protect.",
    text: "Use an email you control. We verify it before collecting authorization or removal data.",
    icon: LockKeyhole,
    aside: "Your account is not created yet. This keeps unfinished signups out of the user database.",
  },
  verify: {
    kicker: "Email verification",
    title: "Confirm this email belongs to you.",
    text: "Enter the 6-digit code before moving to authorization.",
    icon: Mail,
    aside: "Verification protects the account and helps us avoid acting on behalf of the wrong person.",
  },
  consent: {
    kicker: "Authorization",
    title: "Give Ensany permission to act for you.",
    text: "We record this consent with your signature, timestamp, IP address, and browser details.",
    icon: FileSignature,
    aside: "This is the business-critical step: operators need clear authority before contacting brokers.",
  },
  profile: {
    kicker: "Removal intake",
    title: "Add the details brokers use to match records.",
    text: "These fields make removal requests stronger and reduce back-and-forth with brokers.",
    icon: BadgeCheck,
    aside: "Once this is complete, your Ensany workspace is created and ready for removal runs.",
  },
};

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
  const { auth, setAuth } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState("account");
  const [state, setState] = useState(initialSignup);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const currentIndex = steps.indexOf(step);
  const current = stepCopy[step];
  const Icon = current.icon;

  const trustedLine = useMemo(() => {
    if (step === "account") return "Encrypted credentials, verified before launch";
    if (step === "verify") return `Code sent to ${state.email || "your email"}`;
    if (step === "consent") return "Consent recorded before any broker action";
    return "Profile details become your removal request foundation";
  }, [state.email, step]);

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
      setError("You need to authorize Ensany before we can request removals for you.");
      return;
    }
    if (!state.electronicSignature.trim()) {
      setError("Type your name as an electronic signature.");
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
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[1fr,560px]">
      {/* Visual / Info Column */}
      <div className="hidden lg:flex flex-col justify-center p-16 bg-white border-r border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] via-white to-transparent opacity-40" />
        <div className="relative z-10 max-w-xl">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-[#065f46] text-white font-black text-sm">E</span>
            <span className="font-bold text-[#0a0a0a] tracking-tight text-lg">Ensany</span>
          </Link>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-xs font-bold tracking-wider uppercase text-[#065f46] mb-4 block">
              {current.kicker}
            </span>
            <h1 className="text-5xl font-bold text-[#0a0a0a] leading-tight mb-6">
              {current.title}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-12">
              {current.text}
            </p>

            <div className="grid gap-6">
              <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#ecfdf5] text-[#065f46]">
                  <Fingerprint size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0a0a0a]">Private workspace</h3>
                  <p className="text-sm text-gray-500">Encrypted and secure</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle2 size={24} className="text-[#065f46] mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#0a0a0a]">{trustedLine}</h3>
                  <p className="text-sm text-[#065f46]/80">{current.aside}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-16">
        <Card className="w-full max-w-[480px] p-8 lg:p-10 shadow-xl shadow-[#0a0a0a]/5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#065f46] text-white shadow-sm shadow-[#065f46]/20">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Step {currentIndex + 1} of {steps.length}</p>
              <h2 className="text-xl font-bold text-[#0a0a0a]">{current.kicker}</h2>
            </div>
          </div>

          <div className="h-1 bg-gray-100 rounded-full mb-10 overflow-hidden">
            <div 
              className="h-full bg-[#065f46] transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          {step === "account" && (
            <form className="space-y-6" onSubmit={start}>
              <div className="space-y-4">
                <div>
                  <Label>Display name</Label>
                  <Input placeholder="How should we address you?" value={state.displayName} onChange={(event) => update("displayName", event.target.value)} />
                </div>
                <div>
                  <Label>Email address</Label>
                  <Input autoComplete="email" placeholder="you@example.com" type="email" value={state.email} onChange={(event) => update("email", event.target.value)} />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input autoComplete="new-password" placeholder="At least 10 characters" type="password" value={state.password} onChange={(event) => update("password", event.target.value)} />
                </div>
              </div>
              {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}
              <Button className="w-full" size="lg" isLoading={loading}>
                Send verification code <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form className="space-y-6" onSubmit={verify}>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex gap-3 text-emerald-900 text-sm">
                <Mail size={18} className="shrink-0 mt-0.5" />
                <p>We sent a 6-digit code to <strong>{state.email}</strong>. Enter it below to confirm your identity.</p>
              </div>
              
              {state.devVerificationCode && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Dev Code</span>
                  <strong className="text-xl font-mono tracking-[0.5em] text-amber-900 ml-2">{state.devVerificationCode}</strong>
                </div>
              )}

              <div>
                <Label>Verification code</Label>
                <Input 
                  className="text-center text-2xl font-black tracking-[0.5em] focus:tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-base" 
                  inputMode="numeric" 
                  maxLength={6} 
                  placeholder="000000" 
                  value={state.verificationCode} 
                  onChange={(event) => update("verificationCode", event.target.value.replace(/\D/g, ""))} 
                />
              </div>

              {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={goBack} className="shrink-0">
                  <ArrowLeft size={18} />
                </Button>
                <Button className="flex-1" size="lg" isLoading={loading}>
                  Verify email <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {step === "consent" && (
            <form className="space-y-6" onSubmit={acceptConsent}>
              <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg space-y-3">
                <h3 className="font-bold text-[#0a0a0a] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#065f46]" />
                  Removal Authorization
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  "I authorize Ensany to prepare, submit, track, and follow up on personal data removal,
                  deletion, opt-out, and privacy requests on my behalf using the information I provide."
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#065f46] focus:ring-[#065f46] cursor-pointer" 
                  checked={state.consentAccepted} 
                  onChange={(event) => update("consentAccepted", event.target.checked)} 
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#0a0a0a] transition-colors">
                  I understand and authorize Ensany to request data removals on my behalf.
                </span>
              </label>

              <div>
                <Label>Electronic signature</Label>
                <Input placeholder="Type your full name" value={state.electronicSignature} onChange={(event) => update("electronicSignature", event.target.value)} />
              </div>

              {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={goBack} className="shrink-0">
                  <ArrowLeft size={18} />
                </Button>
                <Button className="flex-1" size="lg">
                  Continue <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {step === "profile" && (
            <form className="space-y-6" onSubmit={complete}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Full legal name</Label>
                  <Input autoComplete="name" placeholder="As it appears on official docs" value={state.profile.fullName} onChange={(event) => updateProfile("fullName", event.target.value)} />
                </div>
                <div>
                  <Label>Phone number</Label>
                  <Input autoComplete="tel" placeholder="+20..." value={state.profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} />
                </div>
                <div>
                  <Label>Birth year</Label>
                  <Input inputMode="numeric" placeholder="YYYY" value={state.profile.birthYear} onChange={(event) => updateProfile("birthYear", event.target.value.replace(/\D/g, ""))} />
                </div>
                <div className="col-span-2">
                  <Label>Current address</Label>
                  <Input autoComplete="street-address" placeholder="Street, building, area" value={state.profile.address} onChange={(event) => updateProfile("address", event.target.value)} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input autoComplete="address-level2" placeholder="City" value={state.profile.city} onChange={(event) => updateProfile("city", event.target.value)} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input autoComplete="country-name" placeholder="Country" value={state.profile.country} onChange={(event) => updateProfile("country", event.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Extra matching details</Label>
                  <textarea 
                    className="w-full p-3 bg-white border border-gray-200 rounded-md outline-none focus:border-[#065f46] focus:ring-4 focus:ring-[#065f46]/10 min-h-[100px] text-sm"
                    placeholder="Old names, previous addresses, aliases, or anything operators should know." 
                    value={state.profile.notes} 
                    onChange={(event) => updateProfile("notes", event.target.value)} 
                  />
                </div>
              </div>

              {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={goBack} className="shrink-0">
                  <ArrowLeft size={18} />
                </Button>
                <Button className="flex-1" size="lg" isLoading={loading}>
                  Complete setup <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link to="/login" className="font-bold text-[#065f46] hover:underline">Sign in</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
