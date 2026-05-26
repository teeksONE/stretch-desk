import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  formatTime,
  useTimer,
  type Category,
} from "../features/timer/timerStore";
import {
  buildRoutine,
  type BuiltRoutine,
} from "../features/timer/routineBuilder";

const CATEGORY_LABELS: Record<Category, { title: string; emoji: string }> = {
  stretch: { title: "Stretch", emoji: "🧘" },
  strength: { title: "Strength", emoji: "💪" },
  move: { title: "Move", emoji: "🚶" },
  meditate: { title: "Meditate", emoji: "🌿" },
};

export default function BreakOverlay() {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = (exerciseId ?? "stretch") as Category;
  const label = CATEGORY_LABELS[categoryId] ?? CATEGORY_LABELS.stretch;

  const profile = useTimer((s) => s.profile);
  const breakDuration = parseInt(searchParams.get("duration") ?? "300", 10);

  // Build the routine once at mount — we don't want it reshuffling on rerender.
  const [routine] = useState<BuiltRoutine>(() =>
    buildRoutine(profile, categoryId, breakDuration),
  );

  const [secondsRemaining, setSecondsRemaining] = useState(breakDuration);
  const [secondsOpen, setSecondsOpen] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(
    routine.steps[0]?.durationSeconds ?? 0,
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsOpen((n) => n + 1);
      setSecondsRemaining((n) => Math.max(0, n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const step = routine.steps[stepIndex];
    if (!step) return;
    setStepRemaining(step.durationSeconds);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const next = Math.max(0, step.durationSeconds - elapsed);
      setStepRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        setStepIndex((i) => i + 1);
      }
    }, 200);
    return () => clearInterval(id);
  }, [stepIndex, routine]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const totalSteps = routine.steps.length;
  const allDone = stepIndex >= totalSteps;
  const currentStep = routine.steps[stepIndex] ?? null;
  const canDismiss = secondsOpen >= 10;
  const isOvertime = secondsRemaining === 0;
  const progressPct =
    totalSteps === 0
      ? 100
      : allDone
        ? 100
        : Math.round((stepIndex / totalSteps) * 100);

  const finishBreak = async () => {
    await invoke("finish_break").catch(() => {});
  };

  const handleDone = () => {
    if (!canDismiss) return;
    finishBreak();
  };

  const handleSkip = () => {
    if (!canDismiss) return;
    const confirmed = confirm("Skip this break? It only takes a few minutes.");
    if (confirmed) finishBreak();
  };

  const handleNextStep = () => {
    if (allDone) return;
    setStepIndex((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 bg-bg text-text flex flex-col items-center justify-center px-8 py-10">
      <div className="text-5xl mb-3">{label.emoji}</div>
      <div className="text-xs uppercase tracking-widest text-muted mb-2">
        Break Time
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <h1 className="text-3xl font-semibold">{label.title}</h1>
        {routine.name && routine.name !== label.title && (
          <span className="text-base text-muted">— {routine.name}</span>
        )}
      </div>

      <div className="text-xs text-muted mb-4">
        {totalSteps === 0
          ? "No exercises matched your profile"
          : allDone
            ? "Routine complete"
            : `Step ${stepIndex + 1} of ${totalSteps}`}
      </div>
      <div className="w-full max-w-xl h-1 bg-surface rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {totalSteps === 0 ? (
        <div className="flex flex-col items-center mb-10 max-w-xl text-center">
          <p className="text-lg text-muted mb-2">
            Your current profile filtered out every available exercise.
          </p>
          <p className="text-sm text-muted">
            Open Settings → Profile and broaden your skill level, workspace, or
            equipment options.
          </p>
        </div>
      ) : !allDone && currentStep ? (
        <>
          <h2 className="text-4xl font-medium mb-4 text-center">
            {currentStep.name}
          </h2>
          <p className="max-w-xl text-center text-lg text-muted leading-relaxed mb-8">
            {currentStep.instruction}
          </p>
          <div className="text-6xl font-mono tabular-nums mb-3">
            {String(stepRemaining).padStart(2, "0")}s
          </div>
          <button
            onClick={handleNextStep}
            className="text-sm text-muted hover:text-text mb-10"
          >
            Next step →
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center mb-10">
          <div className="text-2xl mb-3">Nice work.</div>
          <p className="max-w-xl text-center text-base text-muted">
            Take a breath. When you're ready, hit Done to get back to it.
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div
          className={`text-sm font-mono tabular-nums transition-colors ${
            isOvertime ? "text-emerald-400 animate-pulse" : "text-muted"
          }`}
        >
          Overall: {formatTime(secondsRemaining)}
        </div>

        <button
          onClick={handleDone}
          className={`px-10 py-4 font-semibold rounded-xl text-lg transition-all duration-500 ${
            canDismiss
              ? "bg-accent text-bg hover:opacity-90 cursor-pointer"
              : "bg-accent/20 text-bg/40 cursor-default"
          }`}
        >
          Done
        </button>

        <button
          onClick={handleSkip}
          className={`text-xs transition-all duration-500 ${
            canDismiss
              ? "text-muted hover:text-text cursor-pointer"
              : "text-muted/30 cursor-default"
          }`}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
