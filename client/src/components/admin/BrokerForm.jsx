import { Plus, Save, X } from "lucide-react";

export function BrokerForm({ form, setForm, submit, t, mode = "create", onCancel }) {
  const set = (field, value) => setForm({ ...form, [field]: value });
  const isEdit = mode === "edit";

  return (
    <form className="operator-panel broker-form" onSubmit={submit}>
      <div className="form-title-row">
        <h2>{isEdit ? "Edit broker" : t.admin.add}</h2>
        {onCancel && (
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel edit">
            <X size={18} />
          </button>
        )}
      </div>
      <input placeholder={t.admin.brokerName} value={form.name} onChange={(event) => set("name", event.target.value)} />
      <input placeholder="Legal name" value={form.legalName} onChange={(event) => set("legalName", event.target.value)} />
      <div className="two-column">
        <input placeholder="Country" value={form.country} onChange={(event) => set("country", event.target.value)} />
        <input placeholder={t.admin.region} value={form.region} onChange={(event) => set("region", event.target.value)} />
      </div>
      <div className="two-column">
        <input placeholder="General email" value={form.email} onChange={(event) => set("email", event.target.value)} />
        <input placeholder={t.admin.privacyEmail} value={form.privacyEmail} onChange={(event) => set("privacyEmail", event.target.value)} />
      </div>
      <div className="two-column">
        <input placeholder={t.admin.escalationEmail} value={form.escalationEmail} onChange={(event) => set("escalationEmail", event.target.value)} />
        <input placeholder={t.admin.category} value={form.category} onChange={(event) => set("category", event.target.value)} />
      </div>
      <input placeholder={t.admin.website} value={form.website} onChange={(event) => set("website", event.target.value)} />
      <input placeholder={t.admin.formUrl} value={form.removalFormUrl} onChange={(event) => set("removalFormUrl", event.target.value)} />
      <div className="two-column">
        <input placeholder={t.admin.expectedDays} value={form.expectedResponseDays} onChange={(event) => set("expectedResponseDays", event.target.value)} />
        <select value={form.removalMethod} onChange={(event) => set("removalMethod", event.target.value)}>
          <option value="EMAIL">Email</option>
          <option value="FORM">Form</option>
          <option value="EMAIL_AND_FORM">Email and form</option>
        </select>
      </div>
      <div className="two-column">
        <select value={form.riskLevel} onChange={(event) => set("riskLevel", event.target.value)}>
          <option value="UNKNOWN">Unknown risk</option>
          <option value="LOW">Low risk</option>
          <option value="MEDIUM">Medium risk</option>
          <option value="HIGH">High risk</option>
        </select>
        <select value={form.status} onChange={(event) => set("status", event.target.value)}>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>
      <textarea placeholder={t.admin.requiredDataInput} value={form.requiredDataText} onChange={(event) => set("requiredDataText", event.target.value)} />
      <textarea placeholder={t.admin.instructionsInput} value={form.removalInstructions} onChange={(event) => set("removalInstructions", event.target.value)} />
      <button className="primary-button">{isEdit ? <Save size={18} /> : <Plus size={18} />}{isEdit ? "Save broker" : t.admin.add}</button>
    </form>
  );
}
