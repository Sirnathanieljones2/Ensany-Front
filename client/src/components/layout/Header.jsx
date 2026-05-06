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
    ["/methodology", t.nav.about],
    ["/blog", t.nav.blog],
    ["/pricing", t.nav.pricing],
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
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[var(--bg-paper)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link className="no-underline" to="/">
          <span className="font-serif font-bold text-2xl text-[var(--accent)] tracking-tight">Ensany</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {publicNav.map(([href, label]) => (
            <NavLink 
              key={href} 
              to={href} 
              className={({ isActive }) => `text-sm font-medium transition-colors duration-200 no-underline ${isActive ? 'text-[var(--ink-main)] font-bold' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <button 
            className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border-subtle)] bg-white text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--ink-faint)] hover:text-[var(--ink-main)] hover:border-[var(--ink-main)] transition-all rounded-[var(--radius)]" 
            type="button" 
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
          >
            <Languages size={14} className="text-[var(--accent)]" />
            {lang === "en" ? "العربية" : "English"}
          </button>

          <div className="hidden md:flex items-center gap-6 ml-2">
            {auth ? (
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={16} />
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-[var(--ink-muted)] hover:text-[var(--ink-main)] transition-colors no-underline">
                  {t.auth.login}
                </Link>
                <Button as={Link} to="/signup" size="sm" className="px-6">
                  {t.auth.create}
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-[var(--ink-muted)]" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--bg-paper)] border-b border-[var(--border-subtle)] p-8 space-y-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-4">
            {publicNav.map(([href, label]) => (
              <Link 
                key={href} 
                to={href} 
                className="flex items-center justify-between font-serif text-xl text-[var(--ink-main)] no-underline"
                onClick={() => setOpen(false)}
              >
                {label}
                <ChevronRight size={16} className="text-[var(--ink-faint)]" />
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-4">
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
