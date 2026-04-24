import { useTimer, formatTime, Category } from "../features/timer/timerStore";

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "stretch", label: "Stretch", emoji: "🧘" },
  { id: "strength", label: "Strength", emoji: "💪" },
  { id: "move", label: "Move", emoji: "🚶" },
  { id: "meditate", label: "Meditate", emoji: "🌿" },
];

export default function Timer() {
  const phase = useTimer((s) => s.phase);
  const secondsRemaining = useTimer((s) => s.secondsRemaining);
  const workDuration = useTimer((s) => s.workDuration);
  const breakDuration = useTimer((s) => s.breakDuration);
  const category = useTimer((s) => s.category);
  const setCategory = useTimer((s) => s.setCategory);
  const start = useTimer((s) => s.start);
  const stop = useTimer((s) => s.stop);

  const display =
    phase === "idle" ? formatTime(workDuration) : formatTime(secondsRemaining);
  const label =
    phase === "idle" ? "Ready" : phase === "working" ? "Working" : "Break";

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <div className="text-sm uppercase tracking-widest text-muted mb-2">
          {label}
        </div>
        <div className="text-7xl font-mono tabular-nums">{display}</div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            disabled={phase !== "idle"}
            className={`px-4 py-2 rounded-lg border text-sm transition ${
              category === c.id
                ? "bg-accent/20 border-accent text-text"
                : "bg-surface border-border text-muted hover:text-text"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-muted">
        Work {Math.floor(workDuration / 60)}m · Break{" "}
        {Math.floor(breakDuration / 60)}m
      </div>

      {phase === "idle" ? (
        <button
          onClick={start}
          className="px-8 py-3 bg-accent text-bg font-semibold rounded-lg hover:opacity-90"
        >
          Start
        </button>
      ) : (
        <button
          onClick={stop}
          className="px-8 py-3 bg-surface border border-border rounded-lg hover:border-muted"
        >
          Stop
        </button>
      )}
    </div>
  );
}
