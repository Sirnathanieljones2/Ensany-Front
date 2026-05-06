import { ArrowRight, FileText, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";
import { DashboardShowcase } from "../components/marketing/DashboardShowcase.jsx";
import { FeatureGrid } from "../components/marketing/FeatureGrid.jsx";
import { HeroConsole } from "../components/marketing/HeroConsole.jsx";
import { ProcessSection } from "../components/marketing/ProcessSection.jsx";
import { TrustStrip } from "../components/marketing/TrustStrip.jsx";
import { useApp } from "../context/AppContext.jsx";
import { Button } from "../components/ui/Base.jsx";

export function Home() {
  const { t } = useApp();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-[1fr,480px] gap-16 items-center">
          <div className="flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-[#065f46] bg-[#ecfdf5] mb-6">
              {t.home.eyebrow}
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold text-[#0a0a0a] leading-[1.1] tracking-tight mb-8">
              {t.home.title}
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl">
              {t.home.text}
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Button as={Link} to="/signup" size="lg" className="px-8">
                {t.home.primary} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button as={Link} to="/about" variant="secondary" size="lg">
                {t.home.secondary}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-500">
              <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#065f46]" /> {t.home.proof1}</span>
              <span className="flex items-center gap-2"><FileText className="w-5 h-5 text-[#065f46]" /> {t.home.proof2}</span>
              <span className="flex items-center gap-2"><Search className="w-5 h-5 text-[#065f46]" /> {t.home.proof3}</span>
            </div>
          </div>
          <div className="hidden lg:block animate-in fade-in slide-in-from-right-8 duration-1000">
            <HeroConsole />
          </div>
        </div>
      </section>

      {/* Trust/Process/Features - Keeping these modular as they likely contain unique branding logic */}
      <TrustStrip />
      <ProcessSection />
      
      {/* Product Preview */}
      <div className="bg-gray-50 py-24 border-y border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#0a0a0a] mb-4">{t.sections.previewTitle}</h2>
            <p className="text-lg text-gray-500">{t.home.panelSubtitle}</p>
          </div>
          <DashboardShowcase />
        </div>
      </div>

      <FeatureGrid />

      {/* Final CTA */}
      <section className="bg-[#064e3b] py-24">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-left">
            <span className="text-[#a7f3d0] text-sm font-bold tracking-widest uppercase mb-4 block">Get started</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Build a verified removal profile before the first request is sent.
            </h2>
            <p className="text-[#a7f3d0]/80 text-lg leading-relaxed">
              Ensany guides users through verification, consent, and intake so operators have the right foundation from day one.
            </p>
          </div>
          <Button as={Link} to="/signup" size="lg" className="bg-white text-[#064e3b] hover:bg-emerald-50 border-white px-10 whitespace-nowrap">
            Create account <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
