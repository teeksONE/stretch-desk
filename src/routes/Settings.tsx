import { useNavigate } from "react-router-dom";
import { useTimer, type Workspace } from "../features/timer/timerStore";
import {
  USER_AREA_LABELS,
  type SkillLevel,
  type UserBodyArea,
} from "../content/library";
import { EQUIPMENT_OPTIONS } from "../content/equipment";

const WORK_OPTIONS = [15, 25, 45, 60, 90];
const BREAK_OPTIONS = [5, 7, 10, 15];
const WARNING_OPTIONS: { label: string; seconds: number }[] = [
  { label: "Off", seconds: 0 },
  { label: "5s", seconds: 5 },
  { label: "10s", seconds: 10 },
  { label: "30s", seconds: 30 },
];

const USER_AREAS: UserBodyArea[] = [
  "neck",
  "shoulders",
  "chest",
  "back",
  "hips",
  "legs",
  "arms",
];

const SKILL_OPTIONS: { id: SkillLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "pro", label: "Pro" },
];

const WORKSPACE_OPTIONS: { id: Workspace; label: string }[] = [
  { id: "seated", label: "Seated only" },
  { id: "standing-ok", label: "Standing OK" },
];

export default function Settings() {
  const navigate = useNavigate();
  const workDuration = useTimer((s) => s.workDuration);
  const breakDuration = useTimer((s) => s.breakDuration);
  const warningLeadTime = useTimer((s) => s.warningLeadTime);
  const profile = useTimer((s) => s.profile);
  const setWorkDuration = useTimer((s) => s.setWorkDuration);
  const setBreakDuration = useTimer((s) => s.setBreakDuration);
  const setWarningLeadTime = useTimer((s) => s.setWarningLeadTime);
  const setProfileAreasOfFocus = useTimer((s) => s.setProfileAreasOfFocus);
  const setProfileSkillLevel = useTimer((s) => s.setProfileSkillLevel);
  const setProfileWorkspace = useTimer((s) => s.setProfileWorkspace);
  const toggleProfileEquipment = useTimer((s) => s.toggleProfileEquipment);
  const resetOnboarding = useTimer((s) => s.resetOnboarding);

  const toggleArea = (a: UserBodyArea) => {
    const next = profile.areasOfFocus.includes(a)
      ? profile.areasOfFocus.filter((x) => x !== a)
      : [...profile.areasOfFocus, a];
    setProfileAreasOfFocus(next);
  };

  const retakeOnboarding = () => {
    resetOnboarding();
    navigate("/onboarding");
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-10">
      <section className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold">Timing</h2>

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
      </section>

      <hr className="border-border" />

      <section className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button
            onClick={retakeOnboarding}
            className="text-xs text-muted hover:text-text underline underline-offset-2"
          >
            Re-take onboarding
          </button>
        </div>

        <div>
          <div className="text-sm uppercase tracking-widest text-muted mb-3">
            Workspace
          </div>
          <div className="flex gap-2 flex-wrap">
            {WORKSPACE_OPTIONS.map((w) => (
              <button
                key={w.id}
                onClick={() => setProfileWorkspace(w.id)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  profile.workspace === w.id
                    ? "bg-accent/20 border-accent"
                    : "bg-surface border-border text-muted hover:text-text"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm uppercase tracking-widest text-muted mb-3">
            Skill level
          </div>
          <div className="flex gap-2 flex-wrap">
            {SKILL_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setProfileSkillLevel(s.id)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  profile.skillLevel === s.id
                    ? "bg-accent/20 border-accent"
                    : "bg-surface border-border text-muted hover:text-text"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm uppercase tracking-widest text-muted mb-3">
            Areas of focus
          </div>
          <div className="flex gap-2 flex-wrap">
            {USER_AREAS.map((a) => (
              <button
                key={a}
                onClick={() => toggleArea(a)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  profile.areasOfFocus.includes(a)
                    ? "bg-accent/20 border-accent"
                    : "bg-surface border-border text-muted hover:text-text"
                }`}
              >
                {USER_AREA_LABELS[a]}
              </button>
            ))}
          </div>
          {profile.areasOfFocus.length === 0 && (
            <div className="text-xs text-muted mt-2">
              No focus selected — full-body content will be served.
            </div>
          )}
        </div>

        <div>
          <div className="text-sm uppercase tracking-widest text-muted mb-3">
            Equipment
          </div>
          <div className="flex gap-2 flex-wrap">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq.id}
                onClick={() => toggleProfileEquipment(eq.id)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  profile.equipment.includes(eq.id)
                    ? "bg-accent/20 border-accent"
                    : "bg-surface border-border text-muted hover:text-text"
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted mt-2">
            Exercises needing equipment you don't have are filtered out.
          </div>
        </div>
      </section>
    </div>
  );
}
