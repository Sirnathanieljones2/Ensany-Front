export function DataTable({ headers, children }) {
  return (
    <div className="request-table">
      <div className="table-row table-head">
        {headers.map((header) => <span key={header}>{header}</span>)}
      </div>
      {children}
    </div>
  );
}
