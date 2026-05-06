export function MetricGrid({ cards }) {
  return (
    <div className="metric-grid">
      {cards.map(([label, value, Icon]) => (
        <article className="metric-card" key={label}>
          <Icon size={22} />
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  );
}
