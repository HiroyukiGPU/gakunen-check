import { indexToLevel, LEVEL_LABELS, levelToIndex, LEVEL_COUNT } from "../questions/levels";
import type { Level } from "../questions/types";

export interface LevelStat {
  level: Level;
  correct: number;
  total: number;
}

// 学年名だけでなく、レベル内での到達度に応じた表現を作る。
// ネガティブな表現は使わず、「今回の問題では〇〇レベル」というニュアンスに統一する。
export function buildResultTitle(finalLevel: Level, levelStats: LevelStat[]): string {
  const finalLabel = LEVEL_LABELS[finalLevel];
  const finalIndex = levelToIndex(finalLevel);

  const statByLevel = new Map(levelStats.map((s) => [s.level, s]));

  if (finalIndex + 1 < LEVEL_COUNT) {
    const aboveLevel = indexToLevel(finalIndex + 1);
    const aboveStat = statByLevel.get(aboveLevel);
    if (aboveStat && aboveStat.total > 0 && aboveStat.correct > 0) {
      return `${LEVEL_LABELS[aboveLevel]}に挑戦中の${finalLabel}レベル`;
    }
  }

  const finalStat = statByLevel.get(finalLevel);
  const accuracy = finalStat && finalStat.total > 0 ? finalStat.correct / finalStat.total : 0.5;

  if (accuracy >= 0.85) return `かなりできる${finalLabel}レベル`;
  if (accuracy >= 0.6) return `しっかりできる${finalLabel}レベル`;
  if (accuracy >= 0.35) return `基礎を身につけている${finalLabel}レベル`;
  return `${finalLabel}相当`;
}

export function getLevelLabel(level: Level): string {
  return LEVEL_LABELS[level];
}
