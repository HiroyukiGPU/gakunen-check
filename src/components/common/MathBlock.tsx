import { BlockMath } from "react-katex";

// 問題の latex フィールド（ブロック数式）を表示する。
export function MathBlock({ latex }: { latex: string }) {
  return (
    <div className="math-block" aria-label={`数式: ${latex}`}>
      <BlockMath math={latex} errorColor="#d23c3c" />
    </div>
  );
}
