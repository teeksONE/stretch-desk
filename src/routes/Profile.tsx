import { useNavigate } from "react-router-dom";
import { useTimer, type Workspace } from "../features/timer/timerStore";
import {
  USER_AREA_LABELS,
  type SkillLevel,
  type UserBodyArea,
} from "../content/library";
import { EQUIPMENT_OPTIONS } from "../content/equipment";

const USER_AREA_ROWS: UserBodyArea[][] = [
  ["neck"],
  ["shoulders", "chest", "back"],
  ["arms", "hips", "legs"],
];

const SKILL_OPTIONS: { id: SkillLevel; label: string; blurb: string }[] = [
  { id: "beginner", label: "Beginner", blurb: "Beginner-level exercises only." },
  {
    id: "intermediate",
    label: "Intermediate",
    blurb: "Beginner + intermediate.",
  },
  {
    id: "advanced",
    label: "Advanced",
    blurb: "Beginner + intermediate + advanced.",
  },
  { id: "pro", label: "Pro", blurb: "Full library." },
];

const WORKSPACE_OPTIONS: { id: Workspace; label: string }[] = [
  { id: "seated", label: "Seated only" },
  { id: "standing-ok", label: "Standing OK" },
];

export default function Profile() {
  const navigate = useNavigate();
  const profile = useTimer((s) => s.profile);
  const setProfileAreasOfFocus = useTimer((s) => s.setProfileAreasOfFocus);
  const setProfileSkillLevel = useTimer((s) => s.setProfileSkillLevel);
  const setProfileWorkspace = useTimer((s) => s.setProfileWorkspace);
  const setProfileCanLieDown = useTimer((s) => s.setProfileCanLieDown);
  const setProfileEquipment = useTimer((s) => s.setProfileEquipment);
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

  const noneEquipment = profile.equipment.length === 0;

  return (
    <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-8">
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
          Workout space
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
        <button
          onClick={() => setProfileCanLieDown(!profile.canLieDown)}
          className={`mt-2 px-4 py-2 rounded-lg border text-sm ${
            profile.canLieDown
              ? "bg-accent/20 border-accent text-text"
              : "bg-surface border-border text-muted hover:text-text"
          }`}
        >
          {profile.canLieDown ? "✓ " : ""}I can lie on the floor
        </button>
        <div className="text-xs text-muted mt-2">
          Floor exercises are skipped unless this is on.
        </div>
      </div>

      <div>
        <div className="text-sm uppercase tracking-widest text-muted mb-3">
          Skill level
        </div>
        <div className="flex flex-col gap-2">
          {SKILL_OPTIONS.map((s) => {
            const active = profile.skillLevel === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setProfileSkillLevel(s.id)}
                className={`text-left px-4 py-2 rounded-lg border text-sm ${
                  active
                    ? "bg-accent/20 border-accent text-text"
                    : "bg-surface border-border text-muted hover:text-text"
                }`}
              >
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-muted mt-0.5">{s.blurb}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm uppercase tracking-widest text-muted mb-3">
          Areas of focus
        </div>
        <div className="flex flex-col gap-2">
          {USER_AREA_ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              {row.length === 1 && <span />}
              {row.map((a) => {
                const active = profile.areasOfFocus.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleArea(a)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      active
                        ? "bg-accent/20 border-accent text-text"
                        : "bg-surface border-border text-muted hover:text-text"
                    }`}
                  >
                    {USER_AREA_LABELS[a]}
                  </button>
                );
              })}
              {row.length === 1 && <span />}
            </div>
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
          <button
            onClick={() => setProfileEquipment([])}
            className={`px-4 py-2 rounded-lg border text-sm ${
              noneEquipment
                ? "bg-accent/20 border-accent text-text"
                : "bg-surface border-border text-muted hover:text-text"
            }`}
          >
            None
          </button>
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq.id}
              onClick={() => toggleProfileEquipment(eq.id)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                profile.equipment.includes(eq.id)
                  ? "bg-accent/20 border-accent text-text"
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
    </div>
  );
}
