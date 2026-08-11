import type { Level } from "./types";

// レベルの正式な順序。内部ではこの配列のインデックスを数値スコアとして扱う。
export const LEVELS: readonly Level[] = [
  "kindergarten-young",
  "kindergarten-middle",
  "kindergarten-old",
  "elementary-1",
  "elementary-2",
  "elementary-3",
  "elementary-4",
  "elementary-5",
  "elementary-6",
  "junior-high-1",
  "junior-high-2",
  "junior-high-3",
  "high-school-1",
  "high-school-2",
  "high-school-3",
  "university-1",
  "university-2",
  "university-3",
  "university-4",
  "graduate-master-1",
  "graduate-master-2",
  "graduate-doctoral",
];

export const LEVEL_COUNT = LEVELS.length;

const LEVEL_INDEX: ReadonlyMap<Level, number> = new Map(
  LEVELS.map((level, index) => [level, index]),
);

const LEVEL_SET: ReadonlySet<string> = new Set(LEVELS);

export function isValidLevel(value: unknown): value is Level {
  return typeof value === "string" && LEVEL_SET.has(value);
}

export function levelToIndex(level: Level): number {
  const index = LEVEL_INDEX.get(level);
  if (index === undefined) {
    throw new Error(`Unknown level: ${level}`);
  }
  return index;
}

export function indexToLevel(index: number): Level {
  const clamped = Math.min(LEVEL_COUNT - 1, Math.max(0, Math.round(index)));
  return LEVELS[clamped];
}

export function clampIndex(index: number): number {
  return Math.min(LEVEL_COUNT - 1, Math.max(0, index));
}

// 日本語表示用ラベル
export const LEVEL_LABELS: Record<Level, string> = {
  "kindergarten-young": "幼稚園 年少",
  "kindergarten-middle": "幼稚園 年中",
  "kindergarten-old": "幼稚園 年長",
  "elementary-1": "小学1年生",
  "elementary-2": "小学2年生",
  "elementary-3": "小学3年生",
  "elementary-4": "小学4年生",
  "elementary-5": "小学5年生",
  "elementary-6": "小学6年生",
  "junior-high-1": "中学1年生",
  "junior-high-2": "中学2年生",
  "junior-high-3": "中学3年生",
  "high-school-1": "高校1年生",
  "high-school-2": "高校2年生",
  "high-school-3": "高校3年生",
  "university-1": "大学1年生",
  "university-2": "大学2年生",
  "university-3": "大学3年生",
  "university-4": "大学4年生",
  "graduate-master-1": "修士1年",
  "graduate-master-2": "修士2年",
  "graduate-doctoral": "博士課程",
};

export const INITIAL_LEVEL: Level = "junior-high-1";
export const INITIAL_ABILITY = levelToIndex(INITIAL_LEVEL);

// index を中心に radius 以内のレベル一覧を返す（範囲外は自動的に切り詰め）
export function levelsWithinRadius(centerIndex: number, radius: number): Level[] {
  const start = Math.max(0, Math.round(centerIndex) - radius);
  const end = Math.min(LEVEL_COUNT - 1, Math.round(centerIndex) + radius);
  const result: Level[] = [];
  for (let i = start; i <= end; i++) {
    result.push(LEVELS[i]);
  }
  return result;
}
