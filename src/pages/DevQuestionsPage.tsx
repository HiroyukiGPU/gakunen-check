import { useMemo, useState } from "react";
import { LEVEL_LABELS, LEVELS } from "../lib/questions/levels";
import { loadQuestions } from "../lib/questions/loader";
import type { Difficulty, Level, QuestionType } from "../lib/questions/types";

const QUESTION_TYPES: QuestionType[] = [
  "multiple-choice",
  "multiple-select",
  "text",
  "numeric",
  "true-false",
];

const DIFFICULTY_OPTIONS: Array<Difficulty | "unset"> = [1, 2, 3, 4, 5, "unset"];

function countBy<T extends string>(items: T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const item of items) {
    result[item] = (result[item] ?? 0) + 1;
  }
  return result;
}

export function DevQuestionsPage() {
  const { questions, errors, fileStats } = useMemo(() => loadQuestions(), []);

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const levelCounts = useMemo(
    () => countBy(questions.map((q) => q.level)),
    [questions],
  );
  const subjectCounts = useMemo(
    () => countBy(questions.map((q) => q.subject)),
    [questions],
  );

  const presentLevels = LEVELS.filter((level) => (levelCounts[level] ?? 0) > 0);
  const presentSubjects = Object.keys(subjectCounts).sort();

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (levelFilter !== "all" && q.level !== levelFilter) return false;
      if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
      if (typeFilter !== "all" && q.type !== typeFilter) return false;
      if (difficultyFilter !== "all") {
        if (difficultyFilter === "unset") {
          if (q.difficulty !== undefined) return false;
        } else if (q.difficulty !== Number(difficultyFilter)) {
          return false;
        }
      }
      if (query) {
        const haystack = `${q.id} ${q.question}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [questions, levelFilter, subjectFilter, typeFilter, difficultyFilter, search]);

  return (
    <div className="page dev-page">
      <h1 className="dev-heading">開発者向け問題確認画面</h1>

      <section className="dev-stats-grid">
        <div className="dev-stat-card">
          <p className="dev-stat-label">総問題数</p>
          <p className="dev-stat-value">{questions.length}</p>
        </div>
        <div className="dev-stat-card">
          <p className="dev-stat-label">読み込みエラー</p>
          <p className="dev-stat-value">{errors.length}</p>
        </div>
        <div className="dev-stat-card">
          <p className="dev-stat-label">JSONファイル数</p>
          <p className="dev-stat-value">{Object.keys(fileStats).length}</p>
        </div>
      </section>

      <section className="dev-section">
        <h2 className="dev-section-heading">level別 問題数</h2>
        <div className="dev-table-wrap">
          <table className="dev-table">
            <thead>
              <tr>
                <th>level</th>
                <th>件数</th>
              </tr>
            </thead>
            <tbody>
              {presentLevels.map((level) => (
                <tr key={level}>
                  <td>
                    {level}（{LEVEL_LABELS[level as Level]}）
                  </td>
                  <td>{levelCounts[level]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dev-section">
        <h2 className="dev-section-heading">subject別 問題数</h2>
        <div className="dev-table-wrap">
          <table className="dev-table">
            <thead>
              <tr>
                <th>subject</th>
                <th>件数</th>
              </tr>
            </thead>
            <tbody>
              {presentSubjects.map((subject) => (
                <tr key={subject}>
                  <td>{subject}</td>
                  <td>{subjectCounts[subject]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dev-section">
        <h2 className="dev-section-heading">JSONファイル別 問題数</h2>
        <div className="dev-table-wrap">
          <table className="dev-table">
            <thead>
              <tr>
                <th>file</th>
                <th>件数</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fileStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([file, count]) => (
                  <tr key={file}>
                    <td>{file}</td>
                    <td>{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {errors.length > 0 && (
        <section className="dev-section dev-errors">
          <h2 className="dev-section-heading">読み込みエラー</h2>
          <ul className="dev-error-list">
            {errors.map((error, index) => (
              <li key={index} className="dev-error-item">
                <p>
                  <strong>file:</strong> {error.file}
                </p>
                {error.id && (
                  <p>
                    <strong>id:</strong> {error.id}
                  </p>
                )}
                <p>
                  <strong>reason:</strong> {error.reason}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="dev-section">
        <h2 className="dev-section-heading">問題一覧</h2>

        <div className="dev-filters">
          <label className="dev-filter">
            level
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="all">すべて</option>
              {presentLevels.map((level) => (
                <option key={level} value={level}>
                  {LEVEL_LABELS[level as Level]}
                </option>
              ))}
            </select>
          </label>

          <label className="dev-filter">
            subject
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="all">すべて</option>
              {presentSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="dev-filter">
            difficulty
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">すべて</option>
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={String(d)} value={String(d)}>
                  {d === "unset" ? "未設定" : d}
                </option>
              ))}
            </select>
          </label>

          <label className="dev-filter">
            type
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">すべて</option>
              {QUESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="dev-filter dev-filter-search">
            検索（id / question）
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="キーワードを入力"
            />
          </label>
        </div>

        <p className="dev-filter-count">{filteredQuestions.length}件表示中</p>

        <div className="dev-table-wrap">
          <table className="dev-table">
            <thead>
              <tr>
                <th>id</th>
                <th>level</th>
                <th>subject</th>
                <th>difficulty</th>
                <th>type</th>
                <th>question</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.level}</td>
                  <td>{q.subject}</td>
                  <td>{q.difficulty ?? "-"}</td>
                  <td>{q.type}</td>
                  <td className="dev-question-cell">{q.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
