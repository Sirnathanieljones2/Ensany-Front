import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export function AccountHome() {
  const { auth } = useApp();

  return (
    <section className="page-band">
      <div className="page-heading">
        <p className="eyebrow">Welcome back</p>
        <h1>{auth.user.displayName}</h1>
        <p>Your privacy operations workspace is ready.</p>
      </div>
      <Link className="primary-button" to="/app/dashboard">Open dashboard <ArrowRight size={18} /></Link>
    </section>
  );
}
