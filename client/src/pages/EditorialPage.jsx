import { useApp } from "../context/AppContext.jsx";

export function EditorialPage({ type }) {
  const { t } = useApp();
  const isAbout = type === "about";

  return (
    <section className="page-band editorial-page">
      <div className="page-heading">
        <p className="eyebrow">{isAbout ? "About Ensany" : "Pricing"}</p>
        <h1>{isAbout ? t.pages.aboutTitle : t.pages.pricingTitle}</h1>
        <p>{isAbout ? t.pages.aboutText : "Pricing will connect to subscriptions later. For now, these plans describe the product direction."}</p>
      </div>
    </section>
  );
}
