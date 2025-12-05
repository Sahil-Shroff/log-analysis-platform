interface Props {
  message?: string;
}

export function ErrorState({ message = "Something went wrong" }: Props) {
  return <div className="error-text">{message}</div>;
}
