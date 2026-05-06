import { useApp } from "../../context/AppContext.jsx";
import { Link } from "react-router-dom";

export function SiteFooter() {
  const { t } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link className="flex items-center gap-2 group" to="/">
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#065f46] text-white font-black text-xs shadow-md shadow-[#065f46]/10">E</span>
              <span className="font-bold text-[#0a0a0a] tracking-tight text-xl">Ensany</span>
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              {t.sections.footer}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-sm font-bold text-gray-500 hover:text-[#065f46] transition-colors">{t.nav.pricing}</Link></li>
              <li><Link to="/blog" className="text-sm font-bold text-gray-500 hover:text-[#065f46] transition-colors">{t.nav.blog}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm font-bold text-gray-500 hover:text-[#065f46] transition-colors">{t.nav.about}</Link></li>
              <li><a href="mailto:support@ensany.com" className="text-sm font-bold text-gray-500 hover:text-[#065f46] transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            &copy; {currentYear} Ensany. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-[#065f46] uppercase tracking-widest transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-[#065f46] uppercase tracking-widest transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
