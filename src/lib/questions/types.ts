// 学力レベル。数値化した順序は levels.ts で管理する。
export type Level =
  | "kindergarten-young"
  | "kindergarten-middle"
  | "kindergarten-old"
  | "elementary-1"
  | "elementary-2"
  | "elementary-3"
  | "elementary-4"
  | "elementary-5"
  | "elementary-6"
  | "junior-high-1"
  | "junior-high-2"
  | "junior-high-3"
  | "high-school-1"
  | "high-school-2"
  | "high-school-3"
  | "university-1"
  | "university-2"
  | "university-3"
  | "university-4"
  | "graduate-master-1"
  | "graduate-master-2"
  | "graduate-doctoral";

// subject は例示リスト以外の任意文字列も許可する拡張可能な設計。
export type Subject = string;

export const KNOWN_SUBJECTS = [
  "math",
  "japanese",
  "science",
  "social",
  "english",
  "logic",
  "statistics",
  "programming",
  "research",
  "general",
] as const;

export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "text"
  | "numeric"
  | "true-false";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

interface QuestionBase {
  id: string;
  level: Level;
  subject: Subject;
  category?: string;
  difficulty?: Difficulty;
  question: string;
  latex?: string;
  image?: string;
  explanation?: string;
  tags?: string[];
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple-choice";
  choices: string[];
  answer: string;
}

export interface MultipleSelectQuestion extends QuestionBase {
  type: "multiple-select";
  choices: string[];
  answer: string[];
}

export interface TextQuestion extends QuestionBase {
  type: "text";
  answer: string;
}

export interface NumericQuestion extends QuestionBase {
  type: "numeric";
  answer: number;
  tolerance?: number;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: "true-false";
  answer: boolean;
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | TextQuestion
  | NumericQuestion
  | TrueFalseQuestion;

export interface QuestionFile {
  version: number;
  questions: unknown[];
}

export interface ValidationError {
  file: string;
  id?: string;
  reason: string;
}

export interface LoadResult {
  questions: Question[];
  errors: ValidationError[];
  fileStats: Record<string, number>;
}

// ユーザーの回答値（回答形式に応じて型が変わる）
export type UserAnswerValue = string | string[] | number | boolean;
