import { useState } from "react";
import type { Question } from "../../lib/questions/types";
import { Card } from "../common/Card";
import { RichText } from "../common/RichText";

interface FeedbackPanelProps {
  question: Question;
  correct: boolean;
  onNext: () => void;
}

export function FeedbackPanel({ question, correct, onNext }: FeedbackPanelProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <Card className={`feedback-panel ${correct ? "feedback-correct" : "feedback-incorrect"}`}>
      <p className="feedback-result">
        <span className="feedback-icon" aria-hidden="true">
          {correct ? "◯" : "✕"}
        </span>
        <span>{correct ? "正解です！" : "不正解です"}</span>
      </p>

      {question.explanation && (
        <div className="feedback-explanation-area">
          {showExplanation ? (
            <div className="feedback-explanation">
              <RichText text={question.explanation} />
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-explanation"
              onClick={() => setShowExplanation(true)}
            >
              解説を見る
            </button>
          )}
        </div>
      )}

      <button type="button" className="btn btn-primary btn-large btn-block" onClick={onNext}>
        次の問題
      </button>
    </Card>
  );
}
