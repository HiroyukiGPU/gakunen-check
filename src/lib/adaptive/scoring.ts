import type { Difficulty } from "../questions/types";

export type Phase = "fast" | "normal" | "final";

const BASE_STEP = 0.6;

const PHASE_MULTIPLIER: Record<Phase, number> = {
  fast: 2, // 1〜5問目: 高速探索
  normal: 1, // 6〜15問目: 通常探索
  final: 0.5, // 16問目以降: 最終確認
};

const FAST_PHASE_LIMIT = 5;
const NORMAL_PHASE_LIMIT = 15;

// questionNumber は 1 始まりの「これから答える問題が何問目か」
export function getPhase(questionNumber: number): Phase {
  if (questionNumber <= FAST_PHASE_LIMIT) return "fast";
  if (questionNumber <= NORMAL_PHASE_LIMIT) return "normal";
  return "final";
}

// 難易度による倍率。
// 正解時: 難易度が高いほど大きく加点（難易度5正解 -> 1.5倍）。
// 不正解時: 難易度が低いほど大きく減点（難易度1不正解 -> 1.5倍）。
function difficultyFactor(difficulty: Difficulty | undefined, correct: boolean): number {
  const d = difficulty ?? 3;
  const factor = correct ? 1 + (d - 3) * 0.25 : 1 + (3 - d) * 0.25;
  return Math.min(1.5, Math.max(0.5, factor));
}

export function calculateAbilityDelta(
  correct: boolean,
  difficulty: Difficulty | undefined,
  questionNumber: number,
): number {
  const phase = getPhase(questionNumber);
  const magnitude = BASE_STEP * PHASE_MULTIPLIER[phase] * difficultyFactor(difficulty, correct);
  return correct ? magnitude : -magnitude;
}
