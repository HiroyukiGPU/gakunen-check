import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnswerInput } from "../components/quiz/AnswerInput";
import { FeedbackPanel } from "../components/quiz/FeedbackPanel";
import { QuestionCard } from "../components/quiz/QuestionCard";
import { ProgressBar } from "../components/common/ProgressBar";
import {
  applyAnswer,
  createInitialState,
  ESTIMATED_TOTAL_QUESTIONS,
  shouldStopTest,
  type AdaptiveState,
} from "../lib/adaptive/engine";
import { selectNextQuestion } from "../lib/adaptive/selector";
import { checkAnswer, isAnswerEmpty } from "../lib/quiz/answerChecker";
import { applyTrueFalsePolarity } from "../lib/quiz/negation";
import { loadQuestions } from "../lib/questions/loader";
import type { Question, UserAnswerValue } from "../lib/questions/types";
import {
  clearProgress,
  loadLastSessionAskedIds,
  loadProgress,
  saveLastResult,
  saveLastSessionAskedIds,
  saveProgress,
} from "../lib/quiz/storage";

type QuizPhase = "answering" | "feedback";

export function QuizPage() {
  const navigate = useNavigate();
  const [allQuestions] = useState<Question[]>(() => loadQuestions().questions);
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [draftAnswer, setDraftAnswer] = useState<UserAnswerValue | undefined>(undefined);
  const [phase, setPhase] = useState<QuizPhase>("answering");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [noQuestionsAvailable, setNoQuestionsAvailable] = useState(false);

  const startedAtRef = useRef<string>(new Date().toISOString());
  const initializedRef = useRef(false);

  const persist = (state: AdaptiveState, currentQuestionId: string | null) => {
    saveProgress({
      adaptiveState: state,
      currentQuestionId,
      startedAt: startedAtRef.current,
      updatedAt: new Date().toISOString(),
    });
  };

  const finishTest = (state: AdaptiveState) => {
    saveLastSessionAskedIds(state.askedIds);
    saveLastResult(state);
    clearProgress();
    navigate("/result");
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const progress = loadProgress();

    if (progress) {
      startedAtRef.current = progress.startedAt;
      const state = progress.adaptiveState;
      const existing = progress.currentQuestionId
        ? (allQuestions.find((q) => q.id === progress.currentQuestionId) ?? null)
        : null;

      if (existing) {
        setAdaptiveState(state);
        setCurrentQuestion(existing);
        setPhase("answering");
        return;
      }

      const next = selectNextQuestion(state, allQuestions);
      if (!next) {
        finishTest(state);
        return;
      }
      setAdaptiveState(state);
      setCurrentQuestion(applyTrueFalsePolarity(next));
      persist(state, next.id);
      return;
    }

    const avoidIds = loadLastSessionAskedIds();
    const initial = createInitialState(avoidIds);
    const first = selectNextQuestion(initial, allQuestions);
    if (!first) {
      setNoQuestionsAvailable(true);
      return;
    }
    setAdaptiveState(initial);
    setCurrentQuestion(applyTrueFalsePolarity(first));
    persist(initial, first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!currentQuestion || !adaptiveState) return;
    if (isAnswerEmpty(currentQuestion, draftAnswer)) return;

    const correct = checkAnswer(currentQuestion, draftAnswer as UserAnswerValue);
    const newState = applyAnswer(adaptiveState, currentQuestion, correct);
    setAdaptiveState(newState);
    setLastCorrect(correct);
    setPhase("feedback");
    persist(newState, null);
  };

  const handleNext = () => {
    if (!adaptiveState) return;

    if (shouldStopTest(adaptiveState)) {
      finishTest(adaptiveState);
      return;
    }

    const next = selectNextQuestion(adaptiveState, allQuestions);
    if (!next) {
      finishTest(adaptiveState);
      return;
    }

    setCurrentQuestion(applyTrueFalsePolarity(next));
    setDraftAnswer(undefined);
    setPhase("answering");
    persist(adaptiveState, next.id);
  };

  if (noQuestionsAvailable) {
    return (
      <div className="page quiz-page">
        <p className="empty-state">
          出題できる問題が見つかりませんでした。src/questions/ に問題データを追加してください。
        </p>
      </div>
    );
  }

  if (!adaptiveState || !currentQuestion) {
    return (
      <div className="page quiz-page">
        <p className="loading-text">読み込み中...</p>
      </div>
    );
  }

  const questionNumber = adaptiveState.answeredCount + (phase === "answering" ? 1 : 0);

  return (
    <div className="page quiz-page">
      <header className="quiz-header">
        <h1 className="quiz-heading">学力チェック</h1>
        <ProgressBar
          current={questionNumber}
          estimatedTotal={ESTIMATED_TOTAL_QUESTIONS}
          label={`問題 ${questionNumber} / 約${ESTIMATED_TOTAL_QUESTIONS}問`}
        />
      </header>

      <main className="quiz-main">
        <QuestionCard question={currentQuestion}>
          <AnswerInput
            question={currentQuestion}
            value={draftAnswer}
            onChange={setDraftAnswer}
            disabled={phase === "feedback"}
            showResult={phase === "feedback"}
          />
        </QuestionCard>

        {phase === "answering" ? (
          <div className="submit-row">
            <button
              type="button"
              className="btn btn-primary btn-large btn-block"
              disabled={isAnswerEmpty(currentQuestion, draftAnswer)}
              onClick={handleSubmit}
            >
              回答する
            </button>
          </div>
        ) : (
          <FeedbackPanel question={currentQuestion} correct={lastCorrect} onNext={handleNext} />
        )}
      </main>
    </div>
  );
}
