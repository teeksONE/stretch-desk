import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimer, type Workspace } from "../features/timer/timerStore";
import {
  USER_AREA_LABELS,
  type SkillLevel,
  type UserBodyArea,
} from "../content/library";
import { EQUIPMENT_OPTIONS, type Equipment } from "../content/equipment";

const USER_AREAS: UserBodyArea[] = [
  "neck",
  "shoulders",
  "chest",
  "back",
  "hips",
  "legs",
  "arms",
];

const SKILLS: { id: SkillLevel; label: string; blurb: string }[] = [
  {
    id: "beginner",
    label: "Beginner",
    blurb: "New to stretching and movement. Start gentle.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    blurb: "Comfortable with basic movement and body awareness.",
  },
  {
    id: "advanced",
    label: "Advanced",
    blurb: "Regular training, good mobility and control.",
  },
  {
    id: "pro",
    label: "Pro",
    blurb: "Athlete or movement professional. Highest-skill items unlocked.",
  },
];

const WORKSPACES: { id: Workspace; label: string; blurb: string }[] = [
  {
    id: "seated",
    label: "Seated only",
    blurb: "I want exercises I can do without leaving my chair.",
  },
  {
    id: "standing-ok",
    label: "I can stand and move",
    blurb: "I have room to stand, walk, or lie down at my workspace.",
  },
];

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const navigate = useNavigate();
  const profile = useTimer((s) => s.profile);
  const setProfileAreasOfFocus = useTimer((s) => s.setProfileAreasOfFocus);
  const setProfileSkillLevel = useTimer((s) => s.setProfileSkillLevel);
  const setProfileWorkspace = useTimer((s) => s.setProfileWorkspace);
  const setProfileEquipment = useTimer((s) => s.setProfileEquipment);
  const completeOnboarding = useTimer((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState<Workspace>(profile.workspace);
  const [skill, setSkill] = useState<SkillLevel>(profile.skillLevel);
  const [areas, setAreas] = useState<UserBodyArea[]>(profile.areasOfFocus);
  const [equipment, setEquipment] = useState<string[]>(profile.equipment);

  const toggleArea = (a: UserBodyArea) =>
    setAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const toggleEquipment = (id: Equipment) =>
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    setProfileWorkspace(workspace);
    setProfileSkillLevel(skill);
    setProfileAreasOfFocus(areas);
    setProfileEquipment(equipment);
    completeOnboarding();
    navigate("/");
  };

  const skip = () => {
    completeOnboarding();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl">
        <Progress step={step} total={TOTAL_STEPS} />

        <div className="mt-10">
          {step === 0 && (
            <StepWorkspace selected={workspace} onSelect={setWorkspace} />
          )}
          {step === 1 && (
            <StepSkill selected={skill} onSelect={setSkill} />
          )}
          {step === 2 && (
            <StepAreas selected={areas} onToggle={toggleArea} />
          )}
          {step === 3 && (
            <StepEquipment selected={equipment} onToggle={toggleEquipment} />
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={back}
              className="px-4 py-2 text-sm text-muted hover:text-text"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={next}
              className="px-6 py-2 bg-accent text-bg font-semibold rounded-lg hover:opacity-90"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              className="px-6 py-2 bg-accent text-bg font-semibold rounded-lg hover:opacity-90"
            >
              Get started
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={skip}
            className="text-xs text-muted hover:text-text"
          >
            Skip onboarding — I'll set this up later
          </button>
        </div>
      </div>
    </div>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              i <= step ? "bg-accent" : "bg-surface"
            }`}
          />
        ))}
      </div>
      <div className="text-xs uppercase tracking-widest text-muted">
        Step {step + 1} of {total}
      </div>
    </div>
  );
}

function StepWorkspace({
  selected,
  onSelect,
}: {
  selected: Workspace;
  onSelect: (w: Workspace) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">
        Where are you working from?
      </h2>
      <p className="text-sm text-muted mb-6">
        This decides whether breaks include standing or floor-based moves.
      </p>
      <div className="flex flex-col gap-3">
        {WORKSPACES.map((w) => (
          <OptionCard
            key={w.id}
            label={w.label}
            blurb={w.blurb}
            active={selected === w.id}
            onClick={() => onSelect(w.id)}
          />
        ))}
      </div>
    </>
  );
}

function StepSkill({
  selected,
  onSelect,
}: {
  selected: SkillLevel;
  onSelect: (s: SkillLevel) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">
        How comfortable are you with movement?
      </h2>
      <p className="text-sm text-muted mb-6">
        Higher skill unlocks more advanced exercises. You can change this later.
      </p>
      <div className="flex flex-col gap-3">
        {SKILLS.map((s) => (
          <OptionCard
            key={s.id}
            label={s.label}
            blurb={s.blurb}
            active={selected === s.id}
            onClick={() => onSelect(s.id)}
          />
        ))}
      </div>
    </>
  );
}

function StepAreas({
  selected,
  onToggle,
}: {
  selected: UserBodyArea[];
  onToggle: (a: UserBodyArea) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">
        Which areas would you like to focus on?
      </h2>
      <p className="text-sm text-muted mb-6">
        Pick any that bother you or that you'd like to spend more time on.
        Breaks will prioritise these and round out with full-body work.
      </p>
      <div className="flex flex-wrap gap-2">
        {USER_AREAS.map((a) => {
          const active = selected.includes(a);
          return (
            <button
              key={a}
              onClick={() => onToggle(a)}
              className={`px-4 py-2 rounded-lg border text-sm transition ${
                active
                  ? "bg-accent/20 border-accent text-text"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              {USER_AREA_LABELS[a]}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-muted mt-4">
          Nothing selected means full-body — that's a fine default.
        </p>
      )}
    </>
  );
}

function StepEquipment({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: Equipment) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">
        Got any of these handy?
      </h2>
      <p className="text-sm text-muted mb-6">
        Optional. Exercises that need equipment you don't have will be hidden.
      </p>
      <div className="flex flex-col gap-3">
        {EQUIPMENT_OPTIONS.map((eq) => {
          const active = selected.includes(eq.id);
          return (
            <button
              key={eq.id}
              onClick={() => onToggle(eq.id)}
              className={`text-left px-4 py-3 rounded-lg border transition ${
                active
                  ? "bg-accent/20 border-accent text-text"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{eq.label}</span>
                {active && <span className="text-xs text-accent">✓ added</span>}
              </div>
              {eq.hint && (
                <div className="text-xs text-muted mt-1">{eq.hint}</div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function OptionCard({
  label,
  blurb,
  active,
  onClick,
}: {
  label: string;
  blurb: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-lg border transition ${
        active
          ? "bg-accent/20 border-accent text-text"
          : "bg-surface border-border text-muted hover:text-text"
      }`}
    >
      <div className="font-medium mb-1">{label}</div>
      <div className="text-xs text-muted">{blurb}</div>
    </button>
  );
}
