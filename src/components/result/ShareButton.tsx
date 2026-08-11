import { useState } from "react";

interface ShareButtonProps {
  title: string;
  totalCorrect: number;
  totalAnswered: number;
}

function buildShareText({ title, totalCorrect, totalAnswered }: ShareButtonProps): string {
  return `学力診断をやってみた！\n\n結果：\n「${title}」\n\n${totalAnswered}問中${totalCorrect}問正解`;
}

export function ShareButton(props: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const text = buildShareText(props);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使用できない環境では何もしない
    }
  };

  return (
    <button type="button" className="btn btn-secondary btn-large" onClick={handleClick}>
      {copied ? "コピーしました！" : "結果をコピー"}
    </button>
  );
}
