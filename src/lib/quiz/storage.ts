import type { AdaptiveState } from "../adaptive/engine";

const PROGRESS_KEY = "gakuryoku-quiz-progress-v1";
const LAST_ASKED_KEY = "gakuryoku-quiz-last-asked-v1";
const LAST_RESULT_KEY = "gakuryoku-quiz-last-result-v1";

export interface PersistedQuizState {
  adaptiveState: AdaptiveState;
  currentQuestionId: string | null;
  startedAt: string;
  updatedAt: string;
}

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorageが使用できない環境（プライベートモード等）では無視する
  }
}

function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export function saveProgress(state: PersistedQuizState): void {
  safeSetItem(PROGRESS_KEY, JSON.stringify(state));
}

export function loadProgress(): PersistedQuizState | null {
  const raw = safeGetItem(PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedQuizState;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  safeRemoveItem(PROGRESS_KEY);
}

export function hasInProgressQuiz(): boolean {
  return loadProgress() !== null;
}

export function saveLastSessionAskedIds(ids: string[]): void {
  safeSetItem(LAST_ASKED_KEY, JSON.stringify(ids));
}

export function loadLastSessionAskedIds(): string[] {
  const raw = safeGetItem(LAST_ASKED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// 完了したテストの状態を保存する。ResultPage をリロードしても結果を復元できるようにするため。
export function saveLastResult(adaptiveState: AdaptiveState): void {
  safeSetItem(LAST_RESULT_KEY, JSON.stringify(adaptiveState));
}

export function loadLastResult(): AdaptiveState | null {
  const raw = safeGetItem(LAST_RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdaptiveState;
  } catch {
    return null;
  }
}
