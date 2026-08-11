import type { Subject } from "../../lib/questions/types";
import { getSubjectLabel } from "../../lib/results/subjectLabels";
import { Card } from "../common/Card";

interface SubjectBreakdownProps {
  strengths: Subject[];
  growthAreas: Subject[];
}

export function SubjectBreakdown({ strengths, growthAreas }: SubjectBreakdownProps) {
  if (strengths.length === 0 && growthAreas.length === 0) return null;

  return (
    <Card className="result-section">
      <h2 className="result-section-heading">分野別の傾向</h2>

      {strengths.length > 0 && (
        <div className="subject-group">
          <p className="subject-group-heading">得意分野</p>
          <ul className="subject-tags">
            {strengths.map((subject) => (
              <li key={subject} className="subject-tag subject-tag-strength">
                {getSubjectLabel(subject)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {growthAreas.length > 0 && (
        <div className="subject-group">
          <p className="subject-group-heading">もう少し挑戦できそうな分野</p>
          <ul className="subject-tags">
            {growthAreas.map((subject) => (
              <li key={subject} className="subject-tag subject-tag-growth">
                {getSubjectLabel(subject)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
