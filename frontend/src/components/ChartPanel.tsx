import type { ReactNode } from "react";

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ChartPanel({ title, action, children }: Props) {
  return (
    <div className="card chart-panel">
      <div className="panel-head">
        <h3>{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  );
}
