import { useApp } from "../../context/AppContext.jsx";
import { Link } from "react-router-dom";

export function SiteFooter() {
  const { t } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-paper)] border-t border-[var(--border-subtle)] pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link className="no-underline group" to="/">
              <span className="font-serif font-bold text-2xl text-[var(--accent)] tracking-tight">Ensany</span>
            </Link>
            <p className="text-sm text-[var(--ink-muted)] max-w-sm leading-relaxed font-sans">
              {t.sections.footer}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--ink-faint)]">System</h4>
            <ul className="space-y-2 list-none p-0">
              <li><Link to="/pricing" className="text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors no-underline uppercase tracking-tight">{t.nav.pricing}</Link></li>
              <li><Link to="/blog" className="text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors no-underline uppercase tracking-tight">{t.nav.blog}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--ink-faint)]">Operations</h4>
            <ul className="space-y-2 list-none p-0">
              <li><Link to="/about" className="text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors no-underline uppercase tracking-tight">{t.nav.about}</Link></li>
              <li><a href="mailto:support@ensany.com" className="text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors no-underline uppercase tracking-tight">Access Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-dashed border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <p className="text-[9px] font-mono font-bold text-[var(--ink-faint)] uppercase tracking-[0.2em]">
            &copy; {currentYear} Ensany Privacy Systems. Clinical Protection.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[9px] font-mono font-bold text-[var(--ink-faint)] hover:text-[var(--accent)] uppercase tracking-widest no-underline transition-colors">Privacy_Protocol</a>
            <a href="#" className="text-[9px] font-mono font-bold text-[var(--ink-faint)] hover:text-[var(--accent)] uppercase tracking-widest no-underline transition-colors">Terms_of_Mandate</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
