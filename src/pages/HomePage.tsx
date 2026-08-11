import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearProgress, hasInProgressQuiz } from "../lib/quiz/storage";

export function HomePage() {
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    setInProgress(hasInProgressQuiz());
  }, []);

  const startFresh = () => {
    clearProgress();
    navigate("/quiz");
  };

  return (
    <div className="page home-page">
      <div className="home-hero">
        <h1 className="home-title">あなたの学力は何年生？</h1>
        <p className="home-description">
          幼稚園から大学院までの問題を使って、あなたの現在の学力レベルを判定します。
        </p>
        <p className="home-description">
          回答によって問題の難易度が自動的に変化します。
        </p>

        <div className="home-actions">
          {inProgress ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-large btn-block"
                onClick={() => navigate("/quiz")}
              >
                続きから
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-large btn-block"
                onClick={startFresh}
              >
                最初から
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-large btn-block"
              onClick={startFresh}
            >
              診断をはじめる
            </button>
          )}
        </div>

        <p className="home-meta">約20問・5〜10分</p>
      </div>
    </div>
  );
}
