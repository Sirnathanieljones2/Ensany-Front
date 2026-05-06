import { Activity, ClipboardCheck, FileText, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import { featureCards } from "../../data/marketing.js";

const icons = [ClipboardCheck, FileText, Activity, MailCheck, ShieldCheck, LockKeyhole];

export function FeatureGrid() {
  return (
    <section className="feature-section">
      <div className="section-heading">
        <p className="eyebrow">Platform</p>
        <h2>A privacy operations foundation, not just an email sender.</h2>
        <p>Every surface is built around auditability, operator work, and clear progress for users.</p>
      </div>
      <div className="feature-grid">
        {featureCards.map(([title, text], index) => {
          const Icon = icons[index];
          return (
            <article className="feature-card" key={title}>
              <Icon size={22} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
