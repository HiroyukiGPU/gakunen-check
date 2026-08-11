interface ProgressBarProps {
  current: number;
  estimatedTotal: number;
  label: string;
}

export function ProgressBar({ current, estimatedTotal, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((current / estimatedTotal) * 100));

  return (
    <div className="progress-wrap">
      <p className="progress-label">{label}</p>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
