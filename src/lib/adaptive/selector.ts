import { indexToLevel, LEVEL_COUNT, levelsWithinRadius } from "../questions/levels";
import type { Question } from "../questions/types";
import type { AdaptiveState } from "./engine";

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// 現在の能力推定値に最も近いレベル（±1レベル、候補が無ければ範囲を拡大）から、
// 直近の出題科目を避けつつ、未出題の問題をランダムに選ぶ。
export function selectNextQuestion(
  state: AdaptiveState,
  allQuestions: Question[],
): Question | null {
  const centerIndex = Math.round(state.currentAbility);
  const askedSet = new Set(state.askedIds);

  let pool: Question[] = [];
  for (let radius = 1; radius <= LEVEL_COUNT; radius++) {
    const levels = new Set(levelsWithinRadius(centerIndex, radius));
    pool = allQuestions.filter((q) => levels.has(q.level) && !askedSet.has(q.id));
    if (pool.length > 0) break;
  }

  if (pool.length === 0) return null;

  // 科目の偏り防止: 直近3問と異なる科目を優先する
  const recentSubjects = state.recentSubjects;
  const nonRecentSubjectPool = pool.filter((q) => !recentSubjects.includes(q.subject));
  const subjectBalancedPool = nonRecentSubjectPool.length > 0 ? nonRecentSubjectPool : pool;

  // 再挑戦時: 前回出題された問題をできるだけ避ける
  const avoidSet = new Set(state.avoidIds);
  const notPreviouslyAskedPool = subjectBalancedPool.filter((q) => !avoidSet.has(q.id));
  const avoidBalancedPool =
    notPreviouslyAskedPool.length > 0 ? notPreviouslyAskedPool : subjectBalancedPool;

  // 現在レベルちょうどの問題を優先しつつ、隣接レベルも一定確率で選ぶ。
  // ちょうどのレベルの問題数が少ない場合に毎回同じ狭い候補群へ収束してしまうのを
  // 避けるため、優先度は控えめ（35%）にとどめる。
  const currentLevel = indexToLevel(centerIndex);
  const exactLevelPool = avoidBalancedPool.filter((q) => q.level === currentLevel);
  const finalPool =
    exactLevelPool.length > 0 && Math.random() < 0.35 ? exactLevelPool : avoidBalancedPool;

  return pickRandom(finalPool);
}
