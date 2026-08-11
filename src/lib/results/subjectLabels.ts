import type { Subject } from "../questions/types";

const SUBJECT_LABELS: Record<string, string> = {
  math: "数学",
  japanese: "国語",
  science: "理科",
  social: "社会",
  english: "英語",
  logic: "論理",
  statistics: "統計",
  programming: "プログラミング",
  research: "研究",
  general: "一般",
};

// 未知の subject が来ても、そのまま表示できるようにフォールバックする。
export function getSubjectLabel(subject: Subject): string {
  return SUBJECT_LABELS[subject] ?? subject;
}
