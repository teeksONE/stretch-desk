import { useTimer } from "../features/timer/timerStore";

const WORK_OPTIONS = [15, 25, 45, 60, 90];
const BREAK_OPTIONS = [5, 7, 10, 15];
const WARNING_OPTIONS: { label: string; seconds: number }[] = [
  { label: "Off", seconds: 0 },
  { label: "5s", seconds: 5 },
  { label: "10s", seconds: 10 },
  { label: "30s", seconds: 30 },
];

export default function Settings() {
  const workDuration = useTimer((s) => s.workDuration);
  const breakDuration = useTimer((s) => s.breakDuration);
  const warningLeadTime = useTimer((s) => s.warningLeadTime);
  const setWorkDuration = useTimer((s) => s.setWorkDuration);
  const setBreakDuration = useTimer((s) => s.setBreakDuration);
  const setWarningLeadTime = useTimer((s) => s.setWarningLeadTime);

  return (
    <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-8">
      <div>
        <div className="text-sm uppercase tracking-widest text-muted mb-3">
          Work Duration
        </div>
        <div className="flex gap-2 flex-wrap">
          {WORK_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setWorkDuration(m * 60)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                workDuration === m * 60
                  ? "bg-accent/20 border-accent"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm uppercase tracking-widest text-muted mb-3">
          Break Duration
        </div>
        <div className="flex gap-2 flex-wrap">
          {BREAK_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setBreakDuration(m * 60)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                breakDuration === m * 60
                  ? "bg-accent/20 border-accent"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm uppercase tracking-widest text-muted mb-3">
          Pre-break Warning
        </div>
        <div className="flex gap-2 flex-wrap">
          {WARNING_OPTIONS.map((w) => (
            <button
              key={w.seconds}
              onClick={() => setWarningLeadTime(w.seconds)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                warningLeadTime === w.seconds
                  ? "bg-accent/20 border-accent"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted mt-2">
          A small countdown pill appears in the corner before the break overlay.
        </div>
      </div>
    </div>
  );
}
