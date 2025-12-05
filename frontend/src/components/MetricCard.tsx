interface Props {
  title: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "",
  success: "tone-success",
  warning: "tone-warning",
  danger: "tone-danger"
};

export function MetricCard({ title, value, hint, tone = "default" }: Props) {
  return (
    <div className={`card metric-card ${toneClass[tone]}`}>
      <div className="card-title">{title}</div>
      <div className="metric-value">{value}</div>
      {hint && <div className="card-hint">{hint}</div>}
    </div>
  );
}
