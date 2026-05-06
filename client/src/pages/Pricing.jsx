import { Link } from "react-router-dom";
import { pricingPlans } from "../data/marketing.js";
import { Button, Card } from "../components/ui/Base.jsx";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <div className="bg-[var(--bg-paper)] py-32 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--accent)] block">
            Pricing & Protocols
          </span>
          <h1 className="text-5xl lg:text-6xl font-serif text-[var(--ink-main)] tracking-tight">
            Simple plans for serious privacy.
          </h1>
          <p className="text-lg text-[var(--ink-muted)] leading-relaxed font-sans">
            Choose the level of protection that fits your needs. All plans include automated tracking, clinical receipts, and MENA regional expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map(([name, price, text]) => (
            <Card className="p-10 flex flex-col items-start space-y-8 bg-white" key={name}>
              <div className="space-y-4 w-full">
                <h2 className="text-2xl font-serif text-[var(--ink-main)] border-b border-[var(--border-subtle)] pb-4">{name}</h2>
                <div className="flex items-baseline gap-2">
                  <strong className="text-5xl font-serif text-[var(--ink-main)]">{price}</strong>
                  <span className="text-[var(--ink-faint)] text-xs font-mono font-bold uppercase tracking-widest">/mo</span>
                </div>
              </div>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed flex-1 font-sans">{text}</p>
              
              <div className="w-full space-y-4">
                <p className="text-[10px] font-mono font-bold text-[var(--ink-faint)] uppercase tracking-widest border-b border-dashed border-[var(--border-subtle)] pb-2">
                  Included Mandates
                </p>
                <ul className="space-y-4 w-full pb-6">
                  <li className="flex items-start gap-3 text-xs text-[var(--ink-muted)] font-medium">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>Automated removal requests across 200+ brokers</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs text-[var(--ink-muted)] font-medium">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>Continuous monitoring and re-removal audits</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs text-[var(--ink-muted)] font-medium">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>Verified "Chain of Custody" audit ledger</span>
                  </li>
                </ul>
              </div>

              <Button as={Link} to="/signup" variant="primary" className="w-full">
                Establish Account
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-[0.2em]">
            Institutional & Enterprise Protection Available Upon Request
          </p>
        </div>
      </div>
    </div>
  );
}
