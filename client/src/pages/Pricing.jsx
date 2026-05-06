import { Link } from "react-router-dom";
import { pricingPlans } from "../data/marketing.js";
import { Button, Card } from "../components/ui/Base.jsx";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <div className="bg-gray-50 py-24 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#065f46]">Pricing</span>
          <h1 className="text-5xl font-bold text-[#0a0a0a] tracking-tight">Simple plans for serious privacy.</h1>
          <p className="text-lg text-gray-500 leading-relaxed">Choose the level of protection that fits your needs. All plans include automated tracking and regional expertise.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map(([name, price, text]) => (
            <Card className="p-8 flex flex-col items-start space-y-6" key={name}>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#0a0a0a]">{name}</h2>
                <div className="flex items-baseline gap-1">
                  <strong className="text-4xl font-bold text-[#0a0a0a]">{price}</strong>
                  <span className="text-gray-400 text-sm font-medium">/month</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{text}</p>
              
              <ul className="space-y-3 w-full pb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-[#065f46]" />
                  <span>Automated removal requests</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-[#065f46]" />
                  <span>Dashboard tracking</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-[#065f46]" />
                  <span>Regional broker playbooks</span>
                </li>
              </ul>

              <Button as={Link} to="/signup" variant="secondary" className="w-full">
                Get started
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
