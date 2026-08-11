import type { ChangeEvent } from "react";
import type { Question, UserAnswerValue } from "../../lib/questions/types";
import { RichText } from "../common/RichText";

interface AnswerInputProps {
  question: Question;
  value: UserAnswerValue | undefined;
  onChange: (value: UserAnswerValue) => void;
  disabled?: boolean;
  // true のとき、選択肢を正解(緑)・不正解として選んだもの(赤)に色分けして表示する。
  showResult?: boolean;
}

function choiceResultClass(isCorrect: boolean, isSelected: boolean): string {
  if (isCorrect) return " correct";
  if (isSelected) return " incorrect";
  return "";
}

export function AnswerInput({
  question,
  value,
  onChange,
  disabled = false,
  showResult = false,
}: AnswerInputProps) {
  switch (question.type) {
    case "multiple-choice": {
      const selected = typeof value === "string" ? value : undefined;
      return (
        <div className="choice-list" role="radiogroup" aria-label="選択肢">
          {question.choices.map((choice, index) => {
            const isCorrect = showResult && choice === question.answer;
            const isSelected = selected === choice;
            return (
              <label
                key={choice}
                className={`choice-item${isSelected ? " selected" : ""}${
                  showResult ? choiceResultClass(isCorrect, isSelected) : ""
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  value={choice}
                  checked={isSelected}
                  onChange={() => onChange(choice)}
                  aria-label={`選択肢 ${index + 1}: ${choice}`}
                  disabled={disabled}
                />
                <span className="choice-label">
                  <RichText text={choice} />
                </span>
                {showResult && isCorrect && (
                  <span className="choice-result-icon" aria-label="正解">
                    ◯
                  </span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className="choice-result-icon" aria-label="あなたの回答（不正解）">
                    ✕
                  </span>
                )}
              </label>
            );
          })}
        </div>
      );
    }
    case "multiple-select": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (choice: string, checked: boolean) => {
        const next = checked
          ? [...selected, choice]
          : selected.filter((v) => v !== choice);
        onChange(next);
      };
      return (
        <div className="choice-list" role="group" aria-label="選択肢（複数選択可）">
          {question.choices.map((choice, index) => {
            const isCorrect = showResult && question.answer.includes(choice);
            const isSelected = selected.includes(choice);
            return (
              <label
                key={choice}
                className={`choice-item${isSelected ? " selected" : ""}${
                  showResult ? choiceResultClass(isCorrect, isSelected) : ""
                }`}
              >
                <input
                  type="checkbox"
                  name={`answer-${question.id}`}
                  value={choice}
                  checked={isSelected}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => toggle(choice, e.target.checked)}
                  aria-label={`選択肢 ${index + 1}: ${choice}`}
                  disabled={disabled}
                />
                <span className="choice-label">
                  <RichText text={choice} />
                </span>
                {showResult && isCorrect && (
                  <span className="choice-result-icon" aria-label="正解">
                    ◯
                  </span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className="choice-result-icon" aria-label="あなたの回答（不正解）">
                    ✕
                  </span>
                )}
              </label>
            );
          })}
        </div>
      );
    }
    case "true-false": {
      const selected = typeof value === "boolean" ? value : undefined;
      return (
        <div className="choice-list true-false-list" role="radiogroup" aria-label="○×">
          {[true, false].map((option) => {
            const isCorrect = showResult && option === question.answer;
            const isSelected = selected === option;
            return (
              <label
                key={String(option)}
                className={`choice-item true-false-item${isSelected ? " selected" : ""}${
                  showResult ? choiceResultClass(isCorrect, isSelected) : ""
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  checked={isSelected}
                  onChange={() => onChange(option)}
                  aria-label={option ? "正しい（○）" : "誤り（×）"}
                  disabled={disabled}
                />
                <span className="choice-label">{option ? "○ 正しい" : "× 誤り"}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case "text": {
      const current = typeof value === "string" ? value : "";
      const isCorrect = showResult && current.trim() === question.answer.trim();
      return (
        <div className="text-answer-wrap">
          <input
            type="text"
            className={`text-answer-input${showResult ? (isCorrect ? " correct" : " incorrect") : ""}`}
            value={current}
            onChange={(e) => onChange(e.target.value)}
            aria-label="回答を入力"
            autoComplete="off"
            disabled={disabled}
          />
          {showResult && !isCorrect && (
            <p className="correct-answer-reveal">正解: {question.answer}</p>
          )}
        </div>
      );
    }
    case "numeric": {
      const current = typeof value === "number" ? value : "";
      const tolerance = question.tolerance ?? 0;
      const isCorrect =
        showResult && typeof current === "number" && Math.abs(current - question.answer) <= tolerance;
      return (
        <div className="text-answer-wrap">
          <input
            type="number"
            inputMode="decimal"
            className={`numeric-answer-input${showResult ? (isCorrect ? " correct" : " incorrect") : ""}`}
            value={current}
            onChange={(e) => {
              const num = e.target.value === "" ? NaN : Number(e.target.value);
              onChange(num);
            }}
            aria-label="数値で回答を入力"
            disabled={disabled}
          />
          {showResult && !isCorrect && (
            <p className="correct-answer-reveal">正解: {question.answer}</p>
          )}
        </div>
      );
    }
  }
}
