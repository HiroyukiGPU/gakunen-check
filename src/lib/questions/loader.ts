import { validateQuestionFile } from "./validator";
import type { LoadResult, Question, ValidationError } from "./types";

// src/questions/ 以下の全 JSON を再帰的かつ自動的に読み込む。
// 新しい JSON ファイルを追加しても import 文の追加は一切不要。
// raw文字列として取り込み、自前で JSON.parse することで、空ファイルや構文エラーが
// あるJSONが1つあってもビルド全体やアプリ全体を落とさず、その1ファイルだけを除外できるようにする。
const questionModules = import.meta.glob<string>("/src/questions/**/*.json", {
  eager: true,
  query: "?raw",
  import: "default",
});

function toRelativePath(absolutePath: string): string {
  return absolutePath.replace(/^\/src\/questions\//, "");
}

let cachedResult: LoadResult | null = null;

function buildLoadResult(): LoadResult {
  const questions: Question[] = [];
  const errors: ValidationError[] = [];
  const fileStats: Record<string, number> = {};
  const seenIds = new Map<string, string>(); // id -> first file that defined it

  const paths = Object.keys(questionModules).sort();

  for (const path of paths) {
    const file = toRelativePath(path);
    const rawText = questionModules[path];

    let raw: unknown;
    try {
      raw = JSON.parse(rawText);
    } catch (e) {
      errors.push({
        file,
        reason: `invalid JSON syntax: ${e instanceof Error ? e.message : String(e)}`,
      });
      fileStats[file] = 0;
      continue;
    }

    let parsed: { questions: Question[]; errors: ValidationError[] };
    try {
      parsed = validateQuestionFile(raw, file);
    } catch (e) {
      errors.push({
        file,
        reason: `failed to parse file: ${e instanceof Error ? e.message : String(e)}`,
      });
      fileStats[file] = 0;
      continue;
    }

    errors.push(...parsed.errors);

    let acceptedCount = 0;
    for (const question of parsed.questions) {
      const existingFile = seenIds.get(question.id);
      if (existingFile) {
        errors.push({
          file,
          id: question.id,
          reason: `duplicate id (already defined in ${existingFile})`,
        });
        continue;
      }
      seenIds.set(question.id, file);
      questions.push(question);
      acceptedCount++;
    }
    fileStats[file] = acceptedCount;
  }

  if (import.meta.env.DEV) {
    for (const error of errors) {
      console.warn(
        `Invalid question:\nfile: ${error.file}${error.id ? `\nid: ${error.id}` : ""}\nreason: ${error.reason}`,
      );
    }
  }

  return { questions, errors, fileStats };
}

// 全 JSON ファイルは import.meta.glob により静的に決まるため、結果は初回計算後にキャッシュする。
export function loadQuestions(): LoadResult {
  if (!cachedResult) {
    cachedResult = buildLoadResult();
  }
  return cachedResult;
}
