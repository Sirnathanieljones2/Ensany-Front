import { ClipboardCheck, Layers3, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { processSteps } from "../../data/marketing.js";

const icons = [ClipboardCheck, Layers3, ShieldCheck];

export function ProcessSection() {
  const { t } = useApp();

  return (
    <section className="process-section">
      <div className="section-heading">
        <p className="eyebrow">Workflow</p>
        <h2>{t.sections.processTitle}</h2>
        <p>Ensany is designed around the real operational flow: verify the user, run the correct broker workflow, and keep proof visible.</p>
      </div>
      <div className="process-lane">
        {processSteps.map((step, index) => {
          const Icon = icons[index];
          return (
            <article className="process-step" key={step.title}>
              <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
              <Icon size={22} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
