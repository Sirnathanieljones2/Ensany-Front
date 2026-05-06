import { useState, useEffect } from "react";
import { Languages, Menu, X, LogOut, ChevronRight } from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { Button } from "../ui/Base.jsx";

export function Header() {
  const { auth, setAuth, lang, setLang, t } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isApp = location.pathname.startsWith('/app');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const publicNav = [
    ["/", t.nav.home],
    ["/about", t.nav.about],
    ["/blog", t.nav.blog],
    ["/pricing", t.nav.pricing],
  ];
  
  const appNav = [
    ["/app/dashboard", t.nav.dashboard],
    ...(auth?.user?.role === "ADMIN" ? [["/app/admin", t.nav.admin]] : []),
    ["/blog", t.nav.blog],
  ];

  function logout() {
    localStorage.removeItem("ensany_token");
    localStorage.removeItem("ensany_user");
    setAuth(null);
    navigate("/");
  }

  // Don't show public header on app pages if a sidebar exists
  if (isApp) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link className="flex items-center gap-2 group" to="/">
          <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#065f46] text-white font-black text-sm shadow-lg shadow-[#065f46]/20 group-hover:scale-105 transition-transform">E</span>
          <span className="font-bold text-[#0a0a0a] tracking-tight text-xl">Ensany</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicNav.map(([href, label]) => (
            <NavLink 
              key={href} 
              to={href} 
              className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${isActive ? 'text-[#065f46] bg-[#ecfdf5]' : 'text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-black tracking-widest uppercase text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all" 
            type="button" 
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
          >
            <Languages size={14} className="text-[#065f46]" />
            {lang === "en" ? "العربية" : "English"}
          </button>

          <div className="hidden md:flex items-center gap-3 ml-2 border-l border-gray-100 pl-5">
            {auth ? (
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400">
                <LogOut size={16} />
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-[#0a0a0a] transition-colors">
                  {t.auth.login}
                </Link>
                <Button as={Link} to="/signup" size="sm" className="px-5">
                  {t.auth.create}
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-500" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-2">
            {publicNav.map(([href, label]) => (
              <Link 
                key={href} 
                to={href} 
                className="flex items-center justify-between p-3 rounded-lg font-bold text-gray-600 active:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {label}
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
            {auth ? (
              <Button onClick={logout} variant="secondary" className="w-full">
                {t.auth.signOut}
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="secondary" className="w-full">
                  {t.auth.login}
                </Button>
                <Button as={Link} to="/signup" className="w-full">
                  {t.auth.create}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
