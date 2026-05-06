import { CheckCircle2, Clock3, FileText, MailCheck, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { heroEvents } from "../../data/marketing.js";

export function HeroConsole() {
  const { t } = useApp();

  return (
    <aside className="hero-console">
      <div className="console-topline">
        <ShieldCheck size={18} />
        <strong>{t.home.panelTitle}</strong>
      </div>
      <p>{t.home.panelSubtitle}</p>
      <div className="console-summary">
        <div><span>Requests</span><strong>Ready</strong></div>
        <div><span>Evidence</span><strong>Tracked</strong></div>
        <div><span>Follow-ups</span><strong>Queued</strong></div>
      </div>
      <div className="console-feed">
        {heroEvents.map((item, index) => (
          <div key={item}>
            {index === 0 && <FileText size={17} />}
            {index === 1 && <MailCheck size={17} />}
            {index === 2 && <Clock3 size={17} />}
            <span>{item}</span>
            <CheckCircle2 size={17} />
          </div>
        ))}
      </div>
    </aside>
  );
}
