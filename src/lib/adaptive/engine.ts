import { clampIndex, INITIAL_ABILITY } from "../questions/levels";
import type { Level, Question, Subject } from "../questions/types";
import { calculateAbilityDelta } from "./scoring";

export interface AnswerRecord {
  questionId: string;
  level: Level;
  subject: Subject;
  difficulty: number | undefined;
  correct: boolean;
  abilityBefore: number;
  abilityAfter: number;
}

export interface AdaptiveState {
  currentAbility: number;
  answeredCount: number;
  history: AnswerRecord[];
  askedIds: string[];
  recentSubjects: Subject[];
  // 前回のテストで出題された問題ID（再挑戦時にできるだけ避けるために使用）
  avoidIds: string[];
}

const RECENT_SUBJECT_WINDOW = 3;

export function createInitialState(avoidIds: string[] = []): AdaptiveState {
  return {
    currentAbility: INITIAL_ABILITY,
    answeredCount: 0,
    history: [],
    askedIds: [],
    recentSubjects: [],
    avoidIds,
  };
}

export function applyAnswer(
  state: AdaptiveState,
  question: Question,
  correct: boolean,
): AdaptiveState {
  const questionNumber = state.answeredCount + 1;
  const delta = calculateAbilityDelta(correct, question.difficulty, questionNumber);
  const abilityBefore = state.currentAbility;
  const abilityAfter = clampIndex(abilityBefore + delta);

  const record: AnswerRecord = {
    questionId: question.id,
    level: question.level,
    subject: question.subject,
    difficulty: question.difficulty,
    correct,
    abilityBefore,
    abilityAfter,
  };

  const recentSubjects = [...state.recentSubjects, question.subject].slice(
    -RECENT_SUBJECT_WINDOW,
  );

  return {
    currentAbility: abilityAfter,
    answeredCount: state.answeredCount + 1,
    history: [...state.history, record],
    askedIds: [...state.askedIds, question.id],
    recentSubjects,
    avoidIds: state.avoidIds,
  };
}

// テストは常にちょうど TOTAL_QUESTIONS 問で終了する。
const TOTAL_QUESTIONS = 30;

export function shouldStopTest(state: AdaptiveState): boolean {
  return state.answeredCount >= TOTAL_QUESTIONS;
}

// UI表示用の想定問題数（実際の出題数 TOTAL_QUESTIONS と一致させる）
export const ESTIMATED_TOTAL_QUESTIONS = TOTAL_QUESTIONS;
