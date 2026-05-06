import { DetailCard } from "../ui/DetailCard.jsx";
import { FormWorkflow } from "./FormWorkflow.jsx";

export function CaseFile({ request, statusLabel, quickStatus, submitFormSubmission, t }) {
  if (!request) return <p className="muted-text">{t.admin.selectRequest}</p>;

  const profile = request.user.profile;
  const broker = request.broker;
  const requiredData = Array.isArray(broker.requiredData) ? broker.requiredData : [];
  const events = request.emailEvents ?? [];

  return (
    <div className="case-file">
      <div className="case-header">
        <div>
          <span className="status-pill">{statusLabel(request.status)}</span>
          <h3>{broker.name}</h3>
          <p className="muted-text">{request.user.email}</p>
        </div>
        <div className="quick-actions">
          {broker.removalFormUrl && (
            <a className="secondary-link" href={broker.removalFormUrl} target="_blank" rel="noreferrer">
              {t.admin.openForm}
            </a>
          )}
          <button type="button" className="secondary-button" onClick={() => quickStatus("FORM_SUBMITTED")}>{t.admin.formSubmitted}</button>
          <button type="button" className="secondary-button" onClick={() => quickStatus("COMPLETED")}>{t.admin.completed}</button>
        </div>
      </div>

      <div className="detail-grid">
        <DetailCard title={t.admin.userProfile} lines={[
          ["Name", profile?.fullName],
          ["Email", request.user.email],
          ["City", profile?.city],
          ["Country", profile?.country],
        ]} />
        <DetailCard title={t.admin.playbook} lines={[
          ["Country", broker.country],
          ["Method", broker.removalMethod?.replaceAll("_", " ")],
          ["Risk", broker.riskLevel?.toLowerCase()],
          ["Email", broker.privacyEmail || broker.email],
        ]} />
      </div>

      <section className="detail-card">
        <h4>{t.admin.requiredData}</h4>
        <div className="chip-list">
          {requiredData.length
            ? requiredData.map((item) => <span className="info-chip" key={item}>{item}</span>)
            : <p className="muted-text">{t.admin.noRequirements}</p>}
        </div>
      </section>

      <section className="detail-card">
        <h4>{t.admin.instructions}</h4>
        <p className="preserve-lines">{broker.removalInstructions || "No operator playbook written yet."}</p>
      </section>

      <FormWorkflow request={request} onSubmitForm={submitFormSubmission} />

      <section className="detail-card">
        <h4>{t.admin.timeline}</h4>
        {events.length ? (
          <ul className="timeline-list">
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.type.replaceAll("_", " ")}</strong>
                <span>{event.provider || "internal"} - {new Date(event.occurredAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">{t.admin.noEvents}</p>
        )}
      </section>
    </div>
  );
}
