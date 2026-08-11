interface RetryButtonProps {
  onRetry: () => void;
}

export function RetryButton({ onRetry }: RetryButtonProps) {
  return (
    <button type="button" className="btn btn-primary btn-large" onClick={onRetry}>
      もう一度挑戦する
    </button>
  );
}
