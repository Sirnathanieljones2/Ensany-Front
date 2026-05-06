import { useState } from "react";
import { ExternalLink, Send } from "lucide-react";

function toDateTimeLocal(value) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value) {
  return value ? new Date(value).toISOString() : undefined;
}

export function FormWorkflow({ request, onSubmitForm }) {
  const broker = request.broker;
  const submissions = request.formSubmissions ?? [];
  const formEnabled =
    broker.removalMethod === "FORM" ||
    broker.removalMethod === "EMAIL_AND_FORM" ||
    request.status === "FORM_REQUIRED" ||
    request.status === "FORM_SUBMITTED" ||
    Boolean(broker.removalFormUrl);

  const [form, setForm] = useState({
    targetUrl: broker.removalFormUrl ?? "",
    confirmationCode: "",
    evidenceUrl: "",
    submittedAt: toDateTimeLocal(),
    nextFollowupAt: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!formEnabled) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onSubmitForm({
        targetUrl: form.targetUrl,
        confirmationCode: form.confirmationCode,
        evidenceUrl: form.evidenceUrl,
        submittedAt: toIso(form.submittedAt),
        nextFollowupAt: toIso(form.nextFollowupAt),
        notes: form.notes,
      });
      setForm((current) => ({
        ...current,
        confirmationCode: "",
        evidenceUrl: "",
        notes: "",
        submittedAt: toDateTimeLocal(),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-workflow detail-card">
      <div className="workflow-title">
        <div>
          <h4>Form workflow</h4>
          <p className="muted-text">Submit the broker form, capture proof, and schedule the next follow-up.</p>
        </div>
        {broker.removalFormUrl && (
          <a className="secondary-link" href={broker.removalFormUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Open form
          </a>
        )}
      </div>

      <form className="workflow-form" onSubmit={submit}>
        <input placeholder="Form URL used" value={form.targetUrl} onChange={(event) => update("targetUrl", event.target.value)} />
        <div className="two-column">
          <input placeholder="Confirmation code or receipt" value={form.confirmationCode} onChange={(event) => update("confirmationCode", event.target.value)} />
          <input placeholder="Evidence URL" value={form.evidenceUrl} onChange={(event) => update("evidenceUrl", event.target.value)} />
        </div>
        <div className="two-column">
          <label className="field-label">
            <span>Submitted at</span>
            <input type="datetime-local" value={form.submittedAt} onChange={(event) => update("submittedAt", event.target.value)} />
          </label>
          <label className="field-label">
            <span>Next follow-up</span>
            <input type="datetime-local" value={form.nextFollowupAt} onChange={(event) => update("nextFollowupAt", event.target.value)} />
          </label>
        </div>
        <textarea placeholder="Submission notes, required fields completed, or broker-specific context" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={submitting}>
          <Send size={18} />
          {submitting ? "Recording..." : "Record form submission"}
        </button>
      </form>

      <div className="submission-history">
        <h4>Submission history</h4>
        {submissions.length ? (
          <ul className="timeline-list">
            {submissions.map((submission) => (
              <li key={submission.id}>
                <strong>{submission.confirmationCode || "Form submitted"}</strong>
                <span>{new Date(submission.submittedAt).toLocaleString()} by {submission.submittedBy?.email || "operator"}</span>
                {submission.targetUrl && <span>{submission.targetUrl}</span>}
                {submission.evidenceUrl && <span>Evidence: {submission.evidenceUrl}</span>}
                {submission.notes && <span>{submission.notes}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">No form submissions recorded yet.</p>
        )}
      </div>
    </section>
  );
}
