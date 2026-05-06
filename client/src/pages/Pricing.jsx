import { Link } from "react-router-dom";
import { pricingPlans } from "../data/marketing.js";

export function Pricing() {
  return (
    <section className="pricing-section">
      {pricingPlans.map(([name, price, text]) => (
        <article className="pricing-card" key={name}>
          <h2>{name}</h2>
          <strong>{price}</strong>
          <p>{text}</p>
          <Link className="secondary-button" to="/login">Choose plan</Link>
        </article>
      ))}
    </section>
  );
}
