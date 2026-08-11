import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LevelBreakdown } from "../components/result/LevelBreakdown";
import { ResultTitle } from "../components/result/ResultTitle";
import { RetryButton } from "../components/result/RetryButton";
import { ShareButton } from "../components/result/ShareButton";
import { SubjectBreakdown } from "../components/result/SubjectBreakdown";
import type { AdaptiveState } from "../lib/adaptive/engine";
import { calculateResult } from "../lib/results/calculateResult";
import { clearProgress, loadLastResult } from "../lib/quiz/storage";

export function ResultPage() {
  const navigate = useNavigate();
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState | null | undefined>(undefined);

  useEffect(() => {
    setAdaptiveState(loadLastResult());
  }, []);

  const result = useMemo(() => {
    if (!adaptiveState) return null;
    return calculateResult(adaptiveState);
  }, [adaptiveState]);

  useEffect(() => {
    if (adaptiveState === null) {
      navigate("/", { replace: true });
    }
  }, [adaptiveState, navigate]);

  const handleRetry = () => {
    clearProgress();
    navigate("/quiz");
  };

  if (adaptiveState === undefined || !result) {
    return (
      <div className="page result-page">
        <p className="loading-text">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="page result-page">
      <ResultTitle title={result.title} />

      <p className="result-total-score">
        全{result.totalAnswered}問中 {result.totalCorrect}問正解
      </p>

      <LevelBreakdown levelStats={result.levelStats} />
      <SubjectBreakdown strengths={result.strengths} growthAreas={result.growthAreas} />

      <div className="result-actions">
        <ShareButton
          title={result.title}
          totalCorrect={result.totalCorrect}
          totalAnswered={result.totalAnswered}
        />
        <RetryButton onRetry={handleRetry} />
      </div>
    </div>
  );
}
