export function DetailCard({ title, lines }) {
  return (
    <section className="detail-card">
      <h4>{title}</h4>
      {lines.map(([label, value]) => (
        <div className="detail-line" key={label}>
          <span>{label}</span>
          <strong>{value || "Not provided"}</strong>
        </div>
      ))}
    </section>
  );
}
