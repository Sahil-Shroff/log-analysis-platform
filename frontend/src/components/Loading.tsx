interface Props {
  text?: string;
}

export function Loading({ text = "Loading..." }: Props) {
  return <div className="muted">{text}</div>;
}
