interface Props {
  value: number;
}

export function StatusPill({ value }: Props) {
  let tone: "ok" | "warn" | "bad" = "ok";
  if (value < 70) tone = "warn";
  if (value < 40) tone = "bad";

  return <span className={`status-pill ${tone}`}>{Math.round(value)}%</span>;
}
