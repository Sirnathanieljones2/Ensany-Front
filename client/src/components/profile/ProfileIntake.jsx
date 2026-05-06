import { useState } from "react";
import { CheckCircle2, ClipboardList, Save } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { missingProfileFields } from "../../lib/profile.js";
import { api } from "../../lib/api.js";

function profileToForm(profile = {}) {
  return {
    fullName: profile.fullName ?? "",
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    birthYear: profile.birthYear ?? "",
    notes: profile.notes ?? "",
  };
}

export function ProfileIntake() {
  const { auth, setAuth, t } = useApp();
  const [form, setForm] = useState(() => profileToForm(auth?.user?.profile));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const missing = missingProfileFields(form);
  const complete = missing.length === 0;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        birthYear: form.birthYear ? Number(form.birthYear) : undefined,
      };
      const result = await api("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const nextAuth = { ...auth, user: result.user };
      localStorage.setItem("ensany_user", JSON.stringify(result.user));
      setAuth(nextAuth);
      setForm(profileToForm(result.user.profile));
      setMessage(t.intake.saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="intake-panel" onSubmit={submit}>
      <div className="intake-heading">
        <div className={complete ? "intake-icon complete" : "intake-icon"}>
          {complete ? <CheckCircle2 size={22} /> : <ClipboardList size={22} />}
        </div>
        <div>
          <h2>{complete ? t.intake.completeTitle : t.intake.title}</h2>
          <p>{complete ? t.intake.completeDescription : t.intake.description}</p>
        </div>
      </div>

      {!complete && (
        <div className="missing-strip">
          <strong>{t.intake.required}</strong>
          {missing.map((field) => <span key={field}>{t.intake[field]}</span>)}
        </div>
      )}

      <div className="intake-grid">
        <input placeholder={t.intake.fullName} value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
        <input placeholder={t.intake.phone} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
        <input placeholder={t.intake.address} value={form.address} onChange={(event) => update("address", event.target.value)} />
        <input placeholder={t.intake.city} value={form.city} onChange={(event) => update("city", event.target.value)} />
        <input placeholder={t.intake.country} value={form.country} onChange={(event) => update("country", event.target.value)} />
        <input placeholder={t.intake.birthYear} value={form.birthYear} onChange={(event) => update("birthYear", event.target.value)} />
      </div>

      <textarea placeholder={t.intake.notes} value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}
      <button className="primary-button" disabled={saving}>
        <Save size={18} />
        {saving ? t.intake.saving : t.intake.save}
      </button>
    </form>
  );
}
