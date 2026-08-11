import { InlineMath } from "react-katex";

// テキスト中の $...$ を KaTeX でインライン数式として表示する。
// choices など将来的に数式を含む可能性のある文字列にも使えるよう共通化している。
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g).filter((part) => part.length > 0);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("$") && part.endsWith("$") && part.length > 2 ? (
          <InlineMath key={index} math={part.slice(1, -1)} errorColor="#d23c3c" />
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
