import type { Question, UserAnswerValue } from "../questions/types";

export function checkAnswer(question: Question, userAnswer: UserAnswerValue): boolean {
  switch (question.type) {
    case "multiple-choice": {
      if (typeof userAnswer !== "string") return false;
      return userAnswer === question.answer;
    }
    case "multiple-select": {
      if (!Array.isArray(userAnswer)) return false;
      const given = new Set(userAnswer as string[]);
      const expected = new Set(question.answer);
      if (given.size !== expected.size) return false;
      for (const value of given) {
        if (!expected.has(value)) return false;
      }
      return true;
    }
    case "text": {
      if (typeof userAnswer !== "string") return false;
      return userAnswer.trim() === question.answer.trim();
    }
    case "numeric": {
      if (typeof userAnswer !== "number" || Number.isNaN(userAnswer)) return false;
      const tolerance = question.tolerance ?? 0;
      return Math.abs(userAnswer - question.answer) <= tolerance;
    }
    case "true-false": {
      if (typeof userAnswer !== "boolean") return false;
      return userAnswer === question.answer;
    }
  }
}

export function isAnswerEmpty(question: Question, userAnswer: UserAnswerValue | undefined): boolean {
  if (userAnswer === undefined) return true;
  if (question.type === "multiple-select") {
    return !Array.isArray(userAnswer) || userAnswer.length === 0;
  }
  if (question.type === "text") {
    return typeof userAnswer !== "string" || userAnswer.trim().length === 0;
  }
  if (question.type === "numeric") {
    return typeof userAnswer !== "number" || Number.isNaN(userAnswer);
  }
  return false;
}
