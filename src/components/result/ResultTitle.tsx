interface ResultTitleProps {
  title: string;
}

export function ResultTitle({ title }: ResultTitleProps) {
  return (
    <div className="result-hero">
      <p className="result-hero-lead">あなたの学力は</p>
      <p className="result-hero-title">{title}</p>
      <p className="result-hero-lead">です</p>
    </div>
  );
}
