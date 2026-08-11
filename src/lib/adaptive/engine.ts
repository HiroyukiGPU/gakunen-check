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

const MIN_QUESTIONS = 15;
const MAX_QUESTIONS = 30;
const STABILITY_WINDOW = 5;
const STABILITY_THRESHOLD = 0.75;
const MIN_NEAR_LEVEL_ANSWERS = 6;

export function shouldStopTest(state: AdaptiveState): boolean {
  if (state.answeredCount >= MAX_QUESTIONS) return true;
  if (state.answeredCount < MIN_QUESTIONS) return false;

  const recent = state.history.slice(-STABILITY_WINDOW).map((h) => h.abilityAfter);
  const variation = Math.max(...recent) - Math.min(...recent);

  const currentLevelIndex = Math.round(state.currentAbility);
  const nearLevelAnswers = state.history.filter(
    (h) => Math.abs(Math.round(h.abilityBefore) - currentLevelIndex) <= 1,
  ).length;

  return variation < STABILITY_THRESHOLD && nearLevelAnswers >= MIN_NEAR_LEVEL_ANSWERS;
}

// UI表示用のおおよその想定問題数
export const ESTIMATED_TOTAL_QUESTIONS = 20;
