import { ArrowRight, FileText, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";
import { useApp } from "../context/AppContext.jsx";
import { Button } from "../components/ui/Base.jsx";

export function Home() {
  const { t } = useApp();

  return (
    <div className="bg-[var(--bg-paper)]">
      {/* Hero Section - Following CANONICAL_DESIGN.html */}
      <section className="hero-section">
        <span className="text-[var(--accent)] font-mono text-xs font-semibold tracking-[0.2em] uppercase mb-6 block">
          {t.home.eyebrow}
        </span>
        <h1 className="text-5xl lg:text-7xl font-serif text-[var(--ink-main)] leading-[1.1] tracking-tight mb-8">
          {t.home.title}
        </h1>
        <p className="text-xl text-[var(--ink-muted)] leading-relaxed mb-10 max-w-2xl mx-auto">
          {t.home.text}
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button as={Link} to="/signup" size="lg" className="px-10">
            {t.home.primary}
          </Button>
          <Button as={Link} to="/methodology" variant="secondary" size="lg">
            {t.home.secondary}
          </Button>
        </div>
        
        {/* Simplified Evidence Visual instead of generic icons */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-mono font-bold text-[var(--ink-faint)] tracking-widest uppercase mt-8">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--accent)]" /> {t.home.proof1}</span>
          <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--accent)]" /> {t.home.proof2}</span>
          <span className="flex items-center gap-2"><Search className="w-4 h-4 text-[var(--accent)]" /> {t.home.proof3}</span>
        </div>
      </section>

      {/* Proof Section - Integrating the "Receipt" Visual from Landing Page Trial */}
      <section className="py-24 px-6 max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-serif text-[var(--ink-main)] mb-6">{t.home.receiptsTitle}</h2>
          <p className="text-lg text-[var(--ink-muted)] mb-6">
            {t.home.receiptsSubtitle}
          </p>
          <p className="text-lg text-[var(--ink-muted)] mb-8">
            {t.home.receiptsText}
          </p>
          <Button as={Link} to="/methodology" variant="secondary">{t.home.secondary}</Button>
        </div>
        
        <div className="relative p-8 bg-white border border-[var(--border-subtle)] font-mono text-xs shadow-[30px_30px_0px_var(--accent-soft)]">
          <div className="absolute -top-3 right-5 bg-[var(--accent)] text-white px-2 py-0.5 text-[10px] font-bold tracking-widest rtl:left-5 rtl:right-auto">OFFICIAL RECEIPT</div>
          <div className="space-y-4">
            <div className="pb-3 border-b border-dashed border-gray-100 flex items-center justify-between">
              <span className="text-[var(--ink-faint)]">UTC 2026.05.06 09:12</span>
              <span className="text-[var(--accent)] font-bold">DELETED</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--ink-faint)]">Entity:</span>
                <span className="text-[var(--ink-muted)]">Acxiom Global Data</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-faint)]">Signal:</span>
                <span className="text-[var(--ink-muted)]">Right-to-be-forgotten</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-faint)]">Status:</span>
                <span className="text-[var(--accent)] font-bold">204 NO_CONTENT</span>
              </div>
            </div>
            <div className="pt-2 text-[10px] text-[var(--ink-faint)] truncate">
              HASH: 403f1f0b3f06f8e4399760acf61fc2b8
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - Refined Editorial Layout */}
      <section className="bg-[#f3f3f1] py-24 px-6 border-y border-[var(--border-subtle)]">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-12">
          <div className="ps-6 border-s border-[var(--border-subtle)]">
            <h3 className="text-2xl font-serif text-[var(--accent)] mb-4">{t.home.feature1Title}</h3>
            <p className="text-[var(--ink-muted)] leading-relaxed text-sm">
              {t.home.feature1Text}
            </p>
          </div>
          <div className="ps-6 border-s border-[var(--border-subtle)]">
            <h3 className="text-2xl font-serif text-[var(--accent)] mb-4">{t.home.feature2Title}</h3>
            <p className="text-[var(--ink-muted)] leading-relaxed text-sm">
              {t.home.feature2Text}
            </p>
          </div>
          <div className="ps-6 border-s border-[var(--border-subtle)]">
            <h3 className="text-2xl font-serif text-[var(--accent)] mb-4">{t.home.feature3Title}</h3>
            <p className="text-[var(--ink-muted)] leading-relaxed text-sm">
              {t.home.feature3Text}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Green */}
      <section className="bg-[var(--accent)] py-24 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-serif text-white leading-tight mb-8">
            {t.home.ctaTitle}
          </h2>
          <Button as={Link} to="/signup" size="lg" className="bg-white text-[var(--accent)] hover:bg-[var(--bg-paper)] border-transparent px-10">
            {t.home.ctaButton}
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
