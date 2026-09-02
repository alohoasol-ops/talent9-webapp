export default function ScoreBars({
  title,
  scores,
}: {
  title: string;
  scores: { label: string; value: number }[];
}) {
  return (
    <div className="field-group">
      <p className="field-group-title">{title}</p>
      {scores.map((s) => (
        <div className="coverage-row" key={s.label}>
          <span className="cov-label">{s.label}</span>
          <span className="cov-track">
            <span className="cov-fill" style={{ width: `${Math.max(0, Math.min(100, s.value))}%` }} />
          </span>
          <span className="cov-n">{Math.round(s.value)} / 100</span>
        </div>
      ))}
    </div>
  );
}
