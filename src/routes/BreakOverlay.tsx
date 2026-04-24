import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { formatTime } from "../features/timer/timerStore";

const CATEGORY_COPY: Record<
  string,
  { title: string; instruction: string; emoji: string }
> = {
  stretch: {
    title: "Stretch",
    emoji: "🧘",
    instruction:
      "Sit nice and tall for the follwoing stretches holding each one for 20-30seconds. Start with Neck side tilt, idea is ear to shoulder. Start with left side then right. Next Chest opener. Clasp your hands together behind you and puff you chest out. Then Seated Spinal twist, right hand to left knee and twist, then the opposite left hand to right knee. Then Seated figure-four stretch, start with left leg on right knee lean forawrd then swap sides. Finally,  Wrist flexor and wrist extensor stretch.",
  },
  strength: {
    title: "Strength",
    emoji: "💪",
    instruction:
      "Seated leg raises: Straighten one leg, hold for 5 seconds, lower. 10 reps per leg. Then 10 desk push-ups. On to a wall sit for 30 seconds. Then, Standing calf raises 10 on each side. Dead-bug 5 on each side. Finish with a plank hold.",
  },
  move: {
    title: "Move",
    emoji: "🚶",
    instruction:
      "Stand up. Walk to the farthest water source in your building, take the stairs if there are any, and come back.",
  },
  meditate: {
    title: "Meditate",
    emoji: "🌿",
    instruction:
      "Close your eyes. Breathe in for 4, hold for 4, breathe out for 4 hold for 4. Notice what is here right now, without judgment. Repeat this breathing pattern, in for 4, hold for 4, out for 4, hold for 4, back in. Focus on your breathing. Let any thoughts that come to mind go with your breath.",
  },
};

export default function BreakOverlay() {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const copy = CATEGORY_COPY[exerciseId ?? "stretch"] ?? CATEGORY_COPY.stretch;

  const breakDuration = parseInt(searchParams.get("duration") ?? "300", 10);

  const [secondsRemaining, setSecondsRemaining] = useState(breakDuration);
  const [secondsOpen, setSecondsOpen] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsOpen((n) => n + 1);
      setSecondsRemaining((n) => Math.max(0, n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canDismiss = secondsOpen >= 10;
  const isOvertime = secondsRemaining === 0;

  // The break window is a separate webview, so we can't call endBreak()
  // on the main window's store directly. Instead, Rust's dismiss_break
  // closes this window, and we emit an event the main window listens for.
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

  return (
    <div className="fixed inset-0 bg-bg text-text flex flex-col items-center justify-center px-8">
      <div className="text-6xl mb-6">{copy.emoji}</div>
      <div className="text-sm uppercase tracking-widest text-muted mb-3">
        Break Time
      </div>
      <h1 className="text-5xl font-semibold mb-8">{copy.title}</h1>
      <p className="max-w-xl text-center text-xl text-muted leading-relaxed mb-12">
        {copy.instruction}
      </p>

      <div className="flex flex-col items-center gap-4">
        <div
          className={`text-4xl font-mono tabular-nums transition-colors ${
            isOvertime ? "text-emerald-400 animate-pulse" : "text-muted"
          }`}
        >
          {formatTime(secondsRemaining)}
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
