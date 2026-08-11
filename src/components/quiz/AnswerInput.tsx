import type { ChangeEvent } from "react";
import type { Question, UserAnswerValue } from "../../lib/questions/types";
import { RichText } from "../common/RichText";

interface AnswerInputProps {
  question: Question;
  value: UserAnswerValue | undefined;
  onChange: (value: UserAnswerValue) => void;
  disabled?: boolean;
}

export function AnswerInput({ question, value, onChange, disabled = false }: AnswerInputProps) {
  switch (question.type) {
    case "multiple-choice": {
      const selected = typeof value === "string" ? value : undefined;
      return (
        <div className="choice-list" role="radiogroup" aria-label="選択肢">
          {question.choices.map((choice, index) => (
            <label
              key={choice}
              className={`choice-item${selected === choice ? " selected" : ""}`}
            >
              <input
                type="radio"
                name={`answer-${question.id}`}
                value={choice}
                checked={selected === choice}
                onChange={() => onChange(choice)}
                aria-label={`選択肢 ${index + 1}: ${choice}`}
                disabled={disabled}
              />
              <span className="choice-label">
                <RichText text={choice} />
              </span>
            </label>
          ))}
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
          {question.choices.map((choice, index) => (
            <label
              key={choice}
              className={`choice-item${selected.includes(choice) ? " selected" : ""}`}
            >
              <input
                type="checkbox"
                name={`answer-${question.id}`}
                value={choice}
                checked={selected.includes(choice)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => toggle(choice, e.target.checked)}
                aria-label={`選択肢 ${index + 1}: ${choice}`}
                disabled={disabled}
              />
              <span className="choice-label">
                <RichText text={choice} />
              </span>
            </label>
          ))}
        </div>
      );
    }
    case "true-false": {
      const selected = typeof value === "boolean" ? value : undefined;
      return (
        <div className="choice-list true-false-list" role="radiogroup" aria-label="○×">
          {[true, false].map((option) => (
            <label
              key={String(option)}
              className={`choice-item true-false-item${selected === option ? " selected" : ""}`}
            >
              <input
                type="radio"
                name={`answer-${question.id}`}
                checked={selected === option}
                onChange={() => onChange(option)}
                aria-label={option ? "正しい（○）" : "誤り（×）"}
                disabled={disabled}
              />
              <span className="choice-label">{option ? "○ 正しい" : "× 誤り"}</span>
            </label>
          ))}
        </div>
      );
    }
    case "text": {
      const current = typeof value === "string" ? value : "";
      return (
        <input
          type="text"
          className="text-answer-input"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          aria-label="回答を入力"
          autoComplete="off"
          disabled={disabled}
        />
      );
    }
    case "numeric": {
      const current = typeof value === "number" ? value : "";
      return (
        <input
          type="number"
          inputMode="decimal"
          className="numeric-answer-input"
          value={current}
          onChange={(e) => {
            const num = e.target.value === "" ? NaN : Number(e.target.value);
            onChange(num);
          }}
          aria-label="数値で回答を入力"
          disabled={disabled}
        />
      );
    }
  }
}
