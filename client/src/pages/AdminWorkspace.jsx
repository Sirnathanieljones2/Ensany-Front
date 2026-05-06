import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Database, ShieldCheck } from "lucide-react";
import { BrokerForm } from "../components/admin/BrokerForm.jsx";
import { CaseFile } from "../components/admin/CaseFile.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { MetricGrid } from "../components/ui/MetricGrid.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useApp } from "../context/AppContext.jsx";
import { editableRemovalStatuses } from "../data/i18n.js";
import { api } from "../lib/api.js";

const initialBrokerForm = {
  name: "",
  legalName: "",
  email: "",
  privacyEmail: "",
  escalationEmail: "",
  website: "",
  removalFormUrl: "",
  country: "",
  region: "Middle East",
  category: "",
  removalMethod: "EMAIL",
  expectedResponseDays: "",
  removalInstructions: "",
  requiredDataText: "Full name\nEmail\nPhone\nAddress",
  riskLevel: "UNKNOWN",
  status: "ACTIVE",
};

function brokerToForm(broker) {
  const requiredData = Array.isArray(broker.requiredData) ? broker.requiredData : [];

  return {
    name: broker.name ?? "",
    legalName: broker.legalName ?? "",
    email: broker.email ?? "",
    privacyEmail: broker.privacyEmail ?? "",
    escalationEmail: broker.escalationEmail ?? "",
    website: broker.website ?? "",
    removalFormUrl: broker.removalFormUrl ?? "",
    country: broker.country ?? "",
    region: broker.region ?? "",
    category: broker.category ?? "",
    removalMethod: broker.removalMethod ?? "EMAIL",
    expectedResponseDays: broker.expectedResponseDays ?? "",
    removalInstructions: broker.removalInstructions ?? "",
    requiredDataText: requiredData.join("\n") || "Full name\nEmail\nPhone\nAddress",
    riskLevel: broker.riskLevel ?? "UNKNOWN",
    status: broker.status ?? "ACTIVE",
  };
}

function brokerPayload(form) {
  return {
    ...form,
    requiredData: form.requiredDataText.split("\n").map((item) => item.trim()).filter(Boolean),
    expectedResponseDays: form.expectedResponseDays || undefined,
  };
}

export function AdminWorkspace() {
  const { statusLabel, t } = useApp();
  const [tab, setTab] = useState("requests");
  const [overview, setOverview] = useState(null);
  const [requests, setRequests] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState("IN_PROGRESS");
  const [note, setNote] = useState("");
  const [brokerForm, setBrokerForm] = useState(initialBrokerForm);
  const [brokerFilters, setBrokerFilters] = useState({ q: "", status: "", country: "", removalMethod: "", riskLevel: "" });
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [editBrokerForm, setEditBrokerForm] = useState(initialBrokerForm);
  const [brokerMessage, setBrokerMessage] = useState("");

  async function loadAdmin() {
    const [overviewData, requestData, auditData] = await Promise.all([
      api("/api/admin/overview"),
      api("/api/admin/requests?take=50"),
      api("/api/admin/audit-logs?take=50"),
    ]);
    setOverview(overviewData.overview);
    setRequests(requestData.requests);
    setAuditLogs(auditData.auditLogs);
    setSelectedRequestId((current) => current || requestData.requests[0]?.id || "");
    await loadBrokers();
  }

  async function loadBrokers(overrides = brokerFilters) {
    const params = new URLSearchParams({ take: "50" });
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const brokerData = await api(`/api/admin/brokers?${params.toString()}`);
    setBrokers(brokerData.brokers);
    const nextSelected = brokerData.brokers.find((broker) => broker.id === selectedBroker?.id) ?? brokerData.brokers[0] ?? null;
    setSelectedBroker(nextSelected);
    if (nextSelected) setEditBrokerForm(brokerToForm(nextSelected));
  }

  async function loadRequestDetail(id) {
    if (!id) {
      setSelectedRequest(null);
      return;
    }
    const detail = await api(`/api/admin/requests/${id}`);
    setSelectedRequest(detail.request);
    setRequestStatus(detail.request.status);
  }

  useEffect(() => {
    loadAdmin().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    loadBrokers().catch((err) => setError(err.message));
  }, [brokerFilters]);

  useEffect(() => {
    loadRequestDetail(selectedRequestId).catch((err) => setError(err.message));
  }, [selectedRequestId]);

  async function updateRequest(event) {
    event.preventDefault();
    if (!selectedRequestId) return;

    await api(`/api/admin/requests/${selectedRequestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: requestStatus, notes: selectedRequest?.notes ?? undefined }),
    });

    if (note.trim()) {
      await api(`/api/admin/requests/${selectedRequestId}/notes`, {
        method: "POST",
        body: JSON.stringify({ note }),
      });
      setNote("");
    }

    await loadAdmin();
    await loadRequestDetail(selectedRequestId);
  }

  async function quickStatus(status) {
    if (!selectedRequestId) return;
    setRequestStatus(status);
    await api(`/api/admin/requests/${selectedRequestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes: selectedRequest?.notes ?? undefined }),
    });
    await loadAdmin();
    await loadRequestDetail(selectedRequestId);
  }

  async function submitFormSubmission(payload) {
    if (!selectedRequestId) return;

    const result = await api(`/api/admin/requests/${selectedRequestId}/form-submissions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSelectedRequest(result.request);
    setRequestStatus(result.request.status);
    await loadAdmin();
  }

  async function createBroker(event) {
    event.preventDefault();
    await api("/api/admin/brokers", {
      method: "POST",
      body: JSON.stringify(brokerPayload(brokerForm)),
    });
    setBrokerForm(initialBrokerForm);
    setBrokerMessage("Broker created.");
    setTab("brokers");
    await loadAdmin();
  }

  async function updateBroker(event) {
    event.preventDefault();
    if (!selectedBroker) return;

    const result = await api(`/api/admin/brokers/${selectedBroker.id}`, {
      method: "PATCH",
      body: JSON.stringify(brokerPayload(editBrokerForm)),
    });

    setSelectedBroker(result.broker);
    setEditBrokerForm(brokerToForm(result.broker));
    setBrokerMessage("Broker updated.");
    await loadAdmin();
  }

  async function quickBrokerStatus(status) {
    if (!selectedBroker) return;

    const result = await api(`/api/admin/brokers/${selectedBroker.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...brokerPayload(editBrokerForm), status }),
    });

    setSelectedBroker(result.broker);
    setEditBrokerForm(brokerToForm(result.broker));
    setBrokerMessage(`Broker marked ${status.toLowerCase()}.`);
    await loadAdmin();
  }

  function updateBrokerFilter(field, value) {
    setBrokerFilters((current) => ({ ...current, [field]: value }));
    setBrokerMessage("");
  }

  function chooseBroker(broker) {
    setSelectedBroker(broker);
    setEditBrokerForm(brokerToForm(broker));
    setBrokerMessage("");
  }

  const overviewCards = [
    [t.admin.users, overview?.totalUsers ?? 0, ShieldCheck],
    [t.admin.brokers, overview?.totalBrokers ?? 0, Database],
    [t.admin.activeBrokers, overview?.activeBrokers ?? 0, CheckCircle2],
    [t.admin.dueFollowups, overview?.dueFollowups ?? 0, Clock3],
  ];

  return (
    <section className="admin-shell app-page">
      <PageHeader eyebrow={t.admin.eyebrow} title={t.admin.title} />
      {error && <p className="form-error">{error}</p>}
      <MetricGrid cards={overviewCards} />
      <div className="segmented admin-tabs">
        <button className={tab === "requests" ? "selected" : ""} type="button" onClick={() => setTab("requests")}>{t.admin.requests}</button>
        <button className={tab === "brokers" ? "selected" : ""} type="button" onClick={() => setTab("brokers")}>{t.admin.brokers}</button>
        <button className={tab === "audit" ? "selected" : ""} type="button" onClick={() => setTab("audit")}>{t.admin.audit}</button>
        <button className={tab === "create" ? "selected" : ""} type="button" onClick={() => setTab("create")}>{t.admin.add}</button>
      </div>

      {tab === "requests" && (
        <div className="admin-grid">
          <DataTable headers={["User", "Broker", "Status", "Updated"]}>
            {requests.map((request) => (
              <button
                className={selectedRequestId === request.id ? "table-row admin-request-row selected-row" : "table-row admin-request-row"}
                key={request.id}
                type="button"
                onClick={() => setSelectedRequestId(request.id)}
              >
                <span>{request.user.email}</span>
                <span>{request.broker.name}</span>
                <span className="status-pill">{statusLabel(request.status)}</span>
                <span>{new Date(request.updatedAt).toLocaleDateString()}</span>
              </button>
            ))}
          </DataTable>

          <form className="operator-panel" onSubmit={updateRequest}>
            <h2>{t.admin.detail}</h2>
            <CaseFile
              request={selectedRequest}
              statusLabel={statusLabel}
              quickStatus={quickStatus}
              submitFormSubmission={submitFormSubmission}
              t={t}
            />
            <h2>{t.admin.action}</h2>
            <select value={requestStatus} onChange={(event) => setRequestStatus(event.target.value)}>
              {editableRemovalStatuses.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
            <textarea placeholder={t.admin.note} value={note} onChange={(event) => setNote(event.target.value)} />
            <button className="primary-button">{t.admin.save}</button>
          </form>
        </div>
      )}

      {tab === "brokers" && (
        <div className="broker-workspace">
          <div className="filter-bar">
            <input placeholder="Search brokers" value={brokerFilters.q} onChange={(event) => updateBrokerFilter("q", event.target.value)} />
            <input placeholder="Country" value={brokerFilters.country} onChange={(event) => updateBrokerFilter("country", event.target.value)} />
            <select value={brokerFilters.status} onChange={(event) => updateBrokerFilter("status", event.target.value)}>
              <option value="">Any status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="RETIRED">Retired</option>
            </select>
            <select value={brokerFilters.removalMethod} onChange={(event) => updateBrokerFilter("removalMethod", event.target.value)}>
              <option value="">Any method</option>
              <option value="EMAIL">Email</option>
              <option value="FORM">Form</option>
              <option value="EMAIL_AND_FORM">Email and form</option>
            </select>
            <select value={brokerFilters.riskLevel} onChange={(event) => updateBrokerFilter("riskLevel", event.target.value)}>
              <option value="">Any risk</option>
              <option value="UNKNOWN">Unknown</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="admin-grid">
            <DataTable headers={["Name", "Country", "Method", "Risk", "Status", "Requests"]}>
              {brokers.map((broker) => (
                <button
                  className={selectedBroker?.id === broker.id ? "table-row broker-row selected-row" : "table-row broker-row"}
                  key={broker.id}
                  type="button"
                  onClick={() => chooseBroker(broker)}
                >
                  <span>{broker.name}</span>
                  <span>{broker.country}</span>
                  <span>{broker.removalMethod.replaceAll("_", " ")}</span>
                  <span>{broker.riskLevel.toLowerCase()}</span>
                  <span className="status-pill">{broker.status.toLowerCase()}</span>
                  <span>{broker._count?.requests ?? 0}</span>
                </button>
              ))}
              {brokers.length === 0 && <p className="empty-state">No brokers match these filters.</p>}
            </DataTable>

            <div>
              {brokerMessage && <p className="form-success">{brokerMessage}</p>}
              {selectedBroker ? (
                <div className="broker-editor">
                  <div className="quick-actions">
                    <button className="secondary-button" type="button" onClick={() => quickBrokerStatus("ACTIVE")}>Activate</button>
                    <button className="secondary-button" type="button" onClick={() => quickBrokerStatus("PAUSED")}>Pause</button>
                    <button className="secondary-button" type="button" onClick={() => quickBrokerStatus("RETIRED")}>Retire</button>
                  </div>
                  <BrokerForm form={editBrokerForm} setForm={setEditBrokerForm} submit={updateBroker} t={t} mode="edit" />
                </div>
              ) : (
                <p className="empty-state">Select a broker to edit its workflow.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <DataTable headers={["Action", "Actor", "Target", "Request", "Created"]}>
          {auditLogs.map((entry) => (
            <div className="table-row audit-row" key={entry.id}>
              <span>{entry.action.replaceAll("_", " ").toLowerCase()}</span>
              <span>{entry.actor?.email || entry.actorEmail || "system"}</span>
              <span>{entry.targetType ? `${entry.targetType}: ${entry.targetId ?? ""}` : "Not provided"}</span>
              <span>{entry.requestId || "Not provided"}</span>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {auditLogs.length === 0 && <p className="empty-state">No audit events recorded yet.</p>}
        </DataTable>
      )}

      {tab === "create" && <BrokerForm form={brokerForm} setForm={setBrokerForm} submit={createBroker} t={t} />}
    </section>
  );
}
