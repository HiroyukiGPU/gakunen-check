import { useState } from "react";

interface ShareButtonProps {
  title: string;
  totalCorrect: number;
  totalAnswered: number;
}

const APP_URL = "https://hiroyukigpu.github.io/gakunen-check/";

function buildShareText({ title, totalCorrect, totalAnswered }: ShareButtonProps): string {
  return `学力診断をやってみた！\n\n結果：\n「${title}」\n\n${totalAnswered}問中${totalCorrect}問正解`;
}

function buildXShareUrl(text: string): string {
  const params = new URLSearchParams({ text, url: APP_URL });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function buildLineShareUrl(text: string): string {
  return `https://line.me/R/msg/text/?${encodeURIComponent(`${text}\n${APP_URL}`)}`;
}

export function ShareButton(props: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(props);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使用できない環境では何もしない
    }
  };

  return (
    <div className="share-buttons">
      <a
        className="btn btn-secondary btn-large share-btn-x"
        href={buildXShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Xで共有
      </a>
      <a
        className="btn btn-secondary btn-large share-btn-line"
        href={buildLineShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
      >
        LINEで共有
      </a>
      <button type="button" className="btn btn-secondary btn-large" onClick={handleCopy}>
        {copied ? "コピーしました！" : "結果をコピー"}
      </button>
    </div>
  );
}
