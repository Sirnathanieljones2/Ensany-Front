import { useApp } from "../../context/AppContext.jsx";
import { dashboardPreviewMetrics, dashboardPreviewRequests } from "../../data/marketing.js";

export function DashboardShowcase() {
  const { t } = useApp();

  return (
    <section className="preview-section">
      <div className="section-heading">
        <p className="eyebrow">Product experience</p>
        <h2>{t.sections.previewTitle}</h2>
      </div>
      <div className="dashboard-preview">
        <div className="preview-sidebar">
          <strong>Ensany</strong>
          <span>Requests</span>
          <span>Forms</span>
          <span>Evidence</span>
        </div>
        <div className="preview-main">
          <div className="preview-metrics">
            {dashboardPreviewMetrics.map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
          <div className="preview-list">
            {dashboardPreviewRequests.map(([item, status]) => (
              <div key={item}><span>{item}</span><em>{status}</em></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}