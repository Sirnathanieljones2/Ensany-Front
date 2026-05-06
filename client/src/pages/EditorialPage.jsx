import { useApp } from "../context/AppContext.jsx";
import { ShieldCheck, Search, FileText } from "lucide-react";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";

export function EditorialPage({ type }) {
  const { t } = useApp();
  const isAbout = type === "about";

  const steps = [
    {
      title: t.pages.methodologyStep1Title,
      text: t.pages.methodologyStep1Text,
      icon: Search
    },
    {
      title: t.pages.methodologyStep2Title,
      text: t.pages.methodologyStep2Text,
      icon: ShieldCheck
    },
    {
      title: t.pages.methodologyStep3Title,
      text: t.pages.methodologyStep3Text,
      icon: FileText
    }
  ];

  return (
    <div className="bg-[var(--bg-paper)] min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Editorial Hero */}
        <section className="py-24 px-6 max-w-[1000px] mx-auto text-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-6 block">
            {isAbout ? "About Ensany" : "The Methodology"}
          </span>
          <h1 className="text-5xl lg:text-7xl font-serif text-[var(--ink-main)] leading-tight mb-8 tracking-tight">
            {isAbout ? t.pages.aboutTitle : t.pages.methodologyTitle}
          </h1>
          <p className="text-xl text-[var(--ink-muted)] leading-relaxed max-w-2xl mx-auto font-sans">
            {isAbout ? t.pages.aboutText : t.pages.methodologyText}
          </p>
        </section>

        {!isAbout && (
          <section className="py-24 px-6 border-t border-[var(--border-subtle)] bg-white">
            <div className="max-w-[1000px] mx-auto">
              <div className="grid md:grid-cols-3 gap-16">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="space-y-6">
                      <div className="w-12 h-12 flex items-center justify-center rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                        <Icon size={24} />
                      </div>
                      <h2 className="text-2xl font-serif text-[var(--ink-main)] leading-tight">
                        {step.title}
                      </h2>
                      <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-24 p-12 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded-[var(--radius)] relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-serif text-[var(--ink-main)]">Operational Discipline</h3>
                    <p className="text-[var(--ink-muted)] leading-relaxed">
                      Most removal services rely on bulk automation that brokers easily ignore. Ensany treats every removal mandate as a clinical process—tracking every status change, follow-up date, and proof of deletion.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <div className="p-6 bg-white border border-[var(--border-subtle)] font-mono text-[10px] space-y-3 w-64 shadow-sm">
                      <div className="text-[var(--ink-faint)] border-b border-dashed pb-2 mb-2">OPERATIONAL_PROTOCOL_V4</div>
                      <div className="flex justify-between"><span>IDENTIFY</span> <span className="text-blue-600">COMPLETE</span></div>
                      <div className="flex justify-between"><span>DISPUTE</span> <span className="text-blue-600">COMPLETE</span></div>
                      <div className="flex justify-between"><span>PURGE</span> <span className="text-[var(--accent)]">VERIFIED</span></div>
                      <div className="pt-2 text-[var(--accent)] font-bold">CHAIN_OF_CUSTODY_LOCKED</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
