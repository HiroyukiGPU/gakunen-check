import { LEVEL_LABELS } from "../../lib/questions/levels";
import type { LevelStat } from "../../lib/results/resultLabels";
import { Card } from "../common/Card";

export function LevelBreakdown({ levelStats }: { levelStats: LevelStat[] }) {
  if (levelStats.length === 0) return null;

  return (
    <Card className="result-section">
      <h2 className="result-section-heading">レベル別の結果</h2>
      <ul className="level-breakdown-list">
        {levelStats.map((stat) => {
          const percent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
          return (
            <li key={stat.level} className="level-breakdown-item">
              <div className="level-breakdown-row">
                <span className="level-breakdown-label">{LEVEL_LABELS[stat.level]}</span>
                <span className="level-breakdown-score">
                  {stat.total}問中{stat.correct}問正解
                </span>
              </div>
              <div className="level-breakdown-bar">
                <div className="level-breakdown-bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
