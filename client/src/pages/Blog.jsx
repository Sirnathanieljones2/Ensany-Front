import { FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { blogPosts } from "../data/marketing.js";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";

export function Blog() {
  const { t } = useApp();

  return (
    <div className="bg-[var(--bg-paper)] min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="py-24 px-6 max-w-[900px] mx-auto">
          <div className="text-center mb-24">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-6 block">
              Knowledge Base
            </span>
            <h1 className="text-5xl lg:text-7xl font-serif text-[var(--ink-main)] leading-tight mb-8 tracking-tight">
              {t.pages.blogTitle}
            </h1>
            <p className="text-xl text-[var(--ink-muted)] leading-relaxed max-w-2xl mx-auto font-sans">
              {t.pages.blogText}
            </p>
          </div>

          <div className="space-y-px bg-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {blogPosts.map((post, idx) => (
              <article 
                key={idx} 
                className="group bg-white py-12 px-8 flex flex-col md:flex-row md:items-center gap-10 hover:bg-[var(--bg-paper)] transition-colors duration-300"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-[var(--ink-faint)] uppercase tracking-widest">
                    <span>Research Paper</span>
                    <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full" />
                    <span>May 2026</span>
                  </div>
                  <h2 className="text-3xl font-serif text-[var(--ink-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                    <Link to="#" className="no-underline text-inherit">{post}</Link>
                  </h2>
                  <p className="text-[var(--ink-muted)] text-sm leading-relaxed max-w-xl">
                    Detailed analysis of Middle Eastern data brokerage networks and the operational challenges of regional identity purging.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3 text-xs font-bold text-[var(--ink-faint)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-widest">
                  Read Analysis
                  <ChevronRight size={14} />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-24 pt-12 border-t border-dashed border-[var(--border-subtle)] text-center">
            <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-widest">
              END OF RECENT INTELLIGENCE • ACCESS FULL ARCHIVE WITH AN ACCOUNT
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
