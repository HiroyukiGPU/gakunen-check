import type { AdaptiveState } from "../adaptive/engine";
import { indexToLevel, LEVELS } from "../questions/levels";
import type { Level, Subject } from "../questions/types";
import { buildResultTitle, type LevelStat } from "./resultLabels";

export interface SubjectStat {
  subject: Subject;
  correct: number;
  total: number;
  accuracy: number;
}

export interface QuizResult {
  finalLevel: Level;
  finalAbility: number;
  title: string;
  totalCorrect: number;
  totalAnswered: number;
  levelStats: LevelStat[];
  subjectStats: SubjectStat[];
  strengths: Subject[];
  growthAreas: Subject[];
}

const STRENGTH_MIN_ATTEMPTS = 2;
const STRENGTH_ACCURACY_THRESHOLD = 0.7;
const GROWTH_MIN_ATTEMPTS = 2;
const GROWTH_ACCURACY_THRESHOLD = 0.5;
const MAX_HIGHLIGHT_SUBJECTS = 3;

export function calculateResult(state: AdaptiveState): QuizResult {
  const finalIndex = Math.round(state.currentAbility);
  const finalLevel = indexToLevel(finalIndex);

  const levelStatMap = new Map<Level, { correct: number; total: number }>();
  const subjectStatMap = new Map<Subject, { correct: number; total: number }>();

  for (const record of state.history) {
    const levelEntry = levelStatMap.get(record.level) ?? { correct: 0, total: 0 };
    levelEntry.total += 1;
    if (record.correct) levelEntry.correct += 1;
    levelStatMap.set(record.level, levelEntry);

    const subjectEntry = subjectStatMap.get(record.subject) ?? { correct: 0, total: 0 };
    subjectEntry.total += 1;
    if (record.correct) subjectEntry.correct += 1;
    subjectStatMap.set(record.subject, subjectEntry);
  }

  const levelStats: LevelStat[] = LEVELS.filter((level) => levelStatMap.has(level)).map(
    (level) => {
      const stat = levelStatMap.get(level)!;
      return { level, correct: stat.correct, total: stat.total };
    },
  );

  const subjectStats: SubjectStat[] = Array.from(subjectStatMap.entries())
    .map(([subject, stat]) => ({
      subject,
      correct: stat.correct,
      total: stat.total,
      accuracy: stat.total > 0 ? stat.correct / stat.total : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const strengths = subjectStats
    .filter((s) => s.total >= STRENGTH_MIN_ATTEMPTS && s.accuracy >= STRENGTH_ACCURACY_THRESHOLD)
    .slice(0, MAX_HIGHLIGHT_SUBJECTS)
    .map((s) => s.subject);

  const growthAreas = subjectStats
    .filter((s) => s.total >= GROWTH_MIN_ATTEMPTS && s.accuracy <= GROWTH_ACCURACY_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, MAX_HIGHLIGHT_SUBJECTS)
    .map((s) => s.subject);

  const totalCorrect = state.history.filter((h) => h.correct).length;

  return {
    finalLevel,
    finalAbility: state.currentAbility,
    title: buildResultTitle(finalLevel, levelStats),
    totalCorrect,
    totalAnswered: state.history.length,
    levelStats,
    subjectStats,
    strengths,
    growthAreas,
  };
}
