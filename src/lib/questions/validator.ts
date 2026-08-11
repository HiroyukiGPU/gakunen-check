import { isValidLevel } from "./levels";
import type {
  Difficulty,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  NumericQuestion,
  Question,
  QuestionType,
  TextQuestion,
  TrueFalseQuestion,
  ValidationError,
} from "./types";

const QUESTION_TYPES: readonly QuestionType[] = [
  "multiple-choice",
  "multiple-select",
  "text",
  "numeric",
  "true-false",
];

type ValidationResult =
  | { ok: true; question: Question }
  | { ok: false; error: ValidationError };

function fail(file: string, reason: string, id?: string): ValidationResult {
  return { ok: false, error: { file, id, reason } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isValidDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export function validateQuestion(
  raw: unknown,
  file: string,
): ValidationResult {
  if (!isRecord(raw)) {
    return fail(file, "question must be an object");
  }

  const id = raw.id;
  if (!isNonEmptyString(id)) {
    return fail(file, "id is required and must be a non-empty string");
  }

  if (!isValidLevel(raw.level)) {
    return fail(file, `level is invalid: ${String(raw.level)}`, id);
  }

  if (!isNonEmptyString(raw.subject)) {
    return fail(file, "subject is required and must be a non-empty string", id);
  }

  if (!isNonEmptyString(raw.question)) {
    return fail(file, "question is required and must be a non-empty string", id);
  }

  if (typeof raw.type !== "string" || !QUESTION_TYPES.includes(raw.type as QuestionType)) {
    return fail(file, `type is invalid: ${String(raw.type)}`, id);
  }

  if (raw.difficulty !== undefined && !isValidDifficulty(raw.difficulty)) {
    return fail(file, "difficulty must be an integer between 1 and 5", id);
  }

  if (raw.category !== undefined && typeof raw.category !== "string") {
    return fail(file, "category must be a string", id);
  }

  if (raw.explanation !== undefined && typeof raw.explanation !== "string") {
    return fail(file, "explanation must be a string", id);
  }

  if (raw.image !== undefined && typeof raw.image !== "string") {
    return fail(file, "image must be a string", id);
  }

  if (raw.latex !== undefined && typeof raw.latex !== "string") {
    return fail(file, "latex must be a string", id);
  }

  if (raw.tags !== undefined && !isStringArray(raw.tags)) {
    return fail(file, "tags must be an array of strings", id);
  }

  const base = {
    id,
    level: raw.level,
    subject: raw.subject,
    category: raw.category as string | undefined,
    difficulty: raw.difficulty as Difficulty | undefined,
    question: raw.question,
    latex: raw.latex as string | undefined,
    image: raw.image as string | undefined,
    explanation: raw.explanation as string | undefined,
    tags: raw.tags as string[] | undefined,
  };

  switch (raw.type as QuestionType) {
    case "multiple-choice": {
      if (!isStringArray(raw.choices) || raw.choices.length === 0) {
        return fail(file, "choices is required for multiple-choice", id);
      }
      if (typeof raw.answer !== "string") {
        return fail(file, "answer must be a string for multiple-choice", id);
      }
      if (!raw.choices.includes(raw.answer)) {
        return fail(file, "answer must be one of choices", id);
      }
      const question: MultipleChoiceQuestion = {
        ...base,
        type: "multiple-choice",
        choices: raw.choices,
        answer: raw.answer,
      };
      return { ok: true, question };
    }
    case "multiple-select": {
      if (!isStringArray(raw.choices) || raw.choices.length === 0) {
        return fail(file, "choices is required for multiple-select", id);
      }
      if (!isStringArray(raw.answer) || raw.answer.length === 0) {
        return fail(file, "answer must be a non-empty string array for multiple-select", id);
      }
      if (!raw.answer.every((a) => raw.choices && (raw.choices as string[]).includes(a))) {
        return fail(file, "answer values must all be included in choices", id);
      }
      const question: MultipleSelectQuestion = {
        ...base,
        type: "multiple-select",
        choices: raw.choices,
        answer: raw.answer,
      };
      return { ok: true, question };
    }
    case "text": {
      if (!isNonEmptyString(raw.answer)) {
        return fail(file, "answer is required for text", id);
      }
      const question: TextQuestion = {
        ...base,
        type: "text",
        answer: raw.answer,
      };
      return { ok: true, question };
    }
    case "numeric": {
      if (typeof raw.answer !== "number" || Number.isNaN(raw.answer)) {
        return fail(file, "answer must be a number for numeric", id);
      }
      if (raw.tolerance !== undefined && typeof raw.tolerance !== "number") {
        return fail(file, "tolerance must be a number", id);
      }
      const question: NumericQuestion = {
        ...base,
        type: "numeric",
        answer: raw.answer,
        tolerance: raw.tolerance as number | undefined,
      };
      return { ok: true, question };
    }
    case "true-false": {
      if (typeof raw.answer !== "boolean") {
        return fail(file, "answer must be a boolean for true-false", id);
      }
      const question: TrueFalseQuestion = {
        ...base,
        type: "true-false",
        answer: raw.answer,
      };
      return { ok: true, question };
    }
    default:
      return fail(file, `unsupported type: ${String(raw.type)}`, id);
  }
}

export function validateQuestionFile(
  raw: unknown,
  file: string,
): { questions: Question[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!isRecord(raw)) {
    errors.push({ file, reason: "file content must be a JSON object" });
    return { questions: [], errors };
  }

  if (!Array.isArray(raw.questions)) {
    errors.push({ file, reason: "questions field must be an array" });
    return { questions: [], errors };
  }

  const questions: Question[] = [];
  for (const rawQuestion of raw.questions) {
    const result = validateQuestion(rawQuestion, file);
    if (result.ok) {
      questions.push(result.question);
    } else {
      errors.push(result.error);
    }
  }

  return { questions, errors };
}
