import type { Question, TrueFalseQuestion } from "../questions/types";

// true-false 問題の文末（語尾）を安全に反転させるためのユーティリティ。
//
// 「文末が肯定形なら正解、否定形なら不正解」のような言い回しパターンから
// 正解を推測されることを防ぐため、対応可能な語尾パターンに限り、アプリ側で
// 文をランダムに反転表示できるようにする。JSON データ自体は一切変更しない。
//
// 安全性を最優先し、確実に反転できると判断できるパターンにのみ対応する。
// 対応できない文は null を返し、その場合は元の文をそのまま表示する。

// 論理否定の意味が曖昧になる可能性がある語（例:「必ずXである」の否定は
// 「必ずXでない」ではなく「Xでないことがある」なので、単純な語尾反転では
// 意味が変わってしまう）を含む文は反転の対象外とする。
const AMBIGUOUS_SCOPE_WORDS = ["必ず", "すべて", "全て", "常に", "絶対に", "決して", "一切"];

// 一見「一段活用（〜iる/〜eる → 〜ない）」に見えるが実際は五段活用の動詞。
// 誤った活用形を生成しないよう、該当する場合は反転を行わない。
const GODAN_LOOKALIKES = [
  "帰る",
  "蹴る",
  "減る",
  "しゃべる",
  "照る",
  "滑る",
  "入る",
  "走る",
  "切る",
  "要る",
  "限る",
  "知る",
  "散る",
  "かじる",
  "いじる",
  "交じる",
  "焦る",
  "茂る",
  "混じる",
  "参る",
  "陥る",
  "罵る",
];

const E_ROW = new Set(["え", "け", "せ", "て", "ね", "へ", "め", "れ", "げ", "ぜ", "で", "べ", "ぺ"]);
const I_ROW = new Set(["い", "き", "し", "ち", "に", "ひ", "み", "り", "ぎ", "じ", "ぢ", "び", "ぴ"]);

// [肯定の語尾, 否定の語尾, 否定→肯定の逆変換も許可するか] のペア。
// 判定は配列の先頭から行うため、より具体的（長い）語尾を先に置くこと。
const SUFFIX_PAIRS: Array<[string, string, boolean]> = [
  ["ではありません", "です", true],
  ["ません", "ます", true],
  ["ではない", "である", true],
  ["ていない", "ている", true],
  ["できない", "できる", true],
  ["ならない", "なる", true],
  ["しない", "する", true],

  // 漢字＋送り仮名で書かれる一段活用の動詞は、送り仮名（ひらがな部分）だけでは
  // 活用の種類を判定できないため、よく使われるものを明示的に辞書登録する。
  ["出ない", "出る", true],
  ["見ない", "見る", true],
  ["食べない", "食べる", true],
  ["起きない", "起きる", true],
  ["考えない", "考える", true],
  ["増えない", "増える", true],
  ["変えない", "変える", true],
  ["覚えない", "覚える", true],
  ["教えない", "教える", true],
  ["生きない", "生きる", true],
  ["逃げない", "逃げる", true],
  ["感じない", "感じる", true],
  ["信じない", "信じる", true],
  ["答えない", "答える", true],
  ["調べない", "調べる", true],
  ["比べない", "比べる", true],
  ["求めない", "求める", true],
  ["認めない", "認める", true],
  ["越えない", "越える", true],
  ["超えない", "超える", true],
  ["生まれない", "生まれる", true],
  ["生じない", "生じる", true],
  ["用いない", "用いる", true],
  ["加えない", "加える", true],

  // 「ある」は「ない」への反転のみ許可する（逆方向は形容詞の否定などと
  // 区別がつかず誤変換の危険があるため）。
  ["ない", "ある", false],
];

function tryFixedSuffixPairs(body: string): string | null {
  for (const [negative, positive, reversible] of SUFFIX_PAIRS) {
    if (body.endsWith(positive)) {
      return body.slice(0, -positive.length) + negative;
    }
    if (reversible && body.endsWith(negative)) {
      return body.slice(0, -negative.length) + positive;
    }
  }
  return null;
}

// 「す」で終わる動詞（辞書形）は例外なく五段活用のため、
// 「す→さない」の変換が常に安全に成立する（例: 出す→出さない）。
function tryGodanSuRule(body: string): string | null {
  if (body.endsWith("さない")) {
    return body.slice(0, -3) + "す";
  }
  if (body.endsWith("す") && !body.endsWith("です")) {
    return body.slice(0, -1) + "さない";
  }
  return null;
}

// 「え段/い段 + る」で終わる動詞は多くが一段活用（例: そろえる→そろえない）。
// ただし一部の五段活用の動詞（帰る、蹴る等）は形が似ているため除外する。
function tryIchidanRule(body: string): string | null {
  if (!body.endsWith("る") || body.length < 2) return null;
  if (GODAN_LOOKALIKES.some((word) => body.endsWith(word))) return null;

  const beforeRu = body[body.length - 2];
  if (E_ROW.has(beforeRu) || I_ROW.has(beforeRu)) {
    return body.slice(0, -1) + "ない";
  }
  return null;
}

/**
 * 文末（語尾）を反転した文を返す。反転できない場合は null を返す。
 * 入力・出力ともに句点「。」で終わる完全な文であることを前提とする。
 */
export function negateJapaneseStatement(text: string): string | null {
  if (!text.endsWith("。")) return null;
  if (AMBIGUOUS_SCOPE_WORDS.some((word) => text.includes(word))) return null;

  const body = text.slice(0, -1);

  const negatedBody =
    tryFixedSuffixPairs(body) ?? tryGodanSuRule(body) ?? tryIchidanRule(body);

  if (negatedBody === null || negatedBody === body) return null;

  return `${negatedBody}。`;
}

const FLIP_PROBABILITY = 0.5;

/**
 * true-false 問題を、50%の確率で文末を反転させた別の問題として返す。
 * 反転した場合は正解（answer）も同時に反転させるため、表示内容と
 * 正誤判定は常に整合する。反転できない文の場合は元の問題をそのまま返す。
 */
export function applyTrueFalsePolarity(
  question: Question,
  random: () => number = Math.random,
): Question {
  if (question.type !== "true-false") return question;
  if (random() >= FLIP_PROBABILITY) return question;

  const negated = negateJapaneseStatement(question.question);
  if (negated === null) return question;

  const flipped: TrueFalseQuestion = {
    ...question,
    question: negated,
    answer: !question.answer,
  };
  return flipped;
}
