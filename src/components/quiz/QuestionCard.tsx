import type { ReactNode } from "react";
import type { Question } from "../../lib/questions/types";
import { Card } from "../common/Card";
import { MathBlock } from "../common/MathBlock";
import { RichText } from "../common/RichText";

interface QuestionCardProps {
  question: Question;
  children: ReactNode;
}

export function QuestionCard({ question, children }: QuestionCardProps) {
  return (
    <Card className="question-card">
      <p className="question-text">
        <RichText text={question.question} />
      </p>
      {question.latex && <MathBlock latex={question.latex} />}
      {question.image && (
        <div className="question-image-wrap">
          <img src={question.image} alt="問題の図" className="question-image" />
        </div>
      )}
      <div className="answer-area">{children}</div>
    </Card>
  );
}
