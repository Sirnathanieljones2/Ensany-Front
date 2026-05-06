import { FileText, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";

const items = [
  ["Secure architecture", LockKeyhole],
  ["Tracked request history", MailCheck],
  ["Regional broker workflows", FileText],
  ["Operator review layer", ShieldCheck],
];

export function TrustStrip() {
  return (
    <section className="trust-strip">
      {items.map(([label, Icon]) => (
        <div key={label}>
          <Icon size={20} />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
