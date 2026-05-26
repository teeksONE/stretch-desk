import {
  STRETCH_LIBRARY,
  STRENGTHEN_LIBRARY,
  USER_AREA_TO_CLINICAL,
  type ClinicalArea,
  type LibraryItem,
  type SkillLevel,
} from "../../content/library";
import { libraryEquipmentSatisfied } from "../../content/equipment";
import {
  MOVE_ROUTINES,
  MEDITATE_ROUTINES,
} from "../../content/legacyRoutines";
import type { Category, Profile } from "./timerStore";

export type RoutineStep = {
  name: string;
  durationSeconds: number;
  instruction: string;
};

const SKILL_RANK: Record<SkillLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  pro: 3,
};

export interface BuiltRoutine {
  name: string;        // routine-level label, e.g. "Stretch" or "Box breathing"
  steps: RoutineStep[];
}

export function buildRoutine(
  profile: Profile,
  category: Category,
  targetSeconds: number,
): BuiltRoutine {
  if (category === "move") {
    return pickLegacyRoutine(MOVE_ROUTINES, "Move");
  }
  if (category === "meditate") {
    return pickLegacyRoutine(MEDITATE_ROUTINES, "Meditate");
  }

  const library =
    category === "strength" ? STRENGTHEN_LIBRARY : STRETCH_LIBRARY;

  const candidates = filterLibrary(library, profile);
  const pool = candidates.length === 0 ? library : candidates;
  const chosen = sampleByScore(pool, profile, targetSeconds);
  return {
    name: category === "strength" ? "Strength" : "Stretch",
    steps: chosen.map((it) => libraryItemToStep(it, category)),
  };
}

function filterLibrary(library: LibraryItem[], profile: Profile): LibraryItem[] {
  const userSkill = SKILL_RANK[profile.skillLevel];
  return library.filter((item) => {
    if (SKILL_RANK[item.skillLevel] > userSkill) return false;
    if (profile.workspace === "seated") {
      if (item.context !== "Seated" && item.context !== "Seated or standing")
        return false;
    }
    if (!libraryEquipmentSatisfied(item.equipment, profile.equipment))
      return false;
    return true;
  });
}

function sampleByScore(
  pool: LibraryItem[],
  profile: Profile,
  targetSeconds: number,
): LibraryItem[] {
  const focusClinical = new Set<ClinicalArea>(
    profile.areasOfFocus.flatMap((a) => USER_AREA_TO_CLINICAL[a]),
  );

  const scored = pool.map((item) => ({
    item,
    score:
      focusClinical.size === 0 || focusClinical.has(item.area)
        ? focusClinical.has(item.area)
          ? 4
          : 1
        : 1, // non-focus items still eligible, just lower weight
  }));

  // Weighted sample without replacement, stopping when accumulated duration
  // meets the target.
  const picked: LibraryItem[] = [];
  let accumulated = 0;
  const remaining = [...scored];

  while (remaining.length > 0 && accumulated < targetSeconds) {
    const totalScore = remaining.reduce((sum, p) => sum + p.score, 0);
    if (totalScore <= 0) break;
    let r = Math.random() * totalScore;
    let idx = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      r -= remaining[i].score;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    const choice = remaining.splice(idx, 1)[0];
    picked.push(choice.item);
    accumulated += stepTotalSeconds(choice.item);
  }

  return picked;
}

function stepTotalSeconds(item: LibraryItem): number {
  // Library `durationSeconds` is the *total* time the exercise takes,
  // not per-rep. Reps and duration are independent: reps tell you how
  // many to do, duration tells you how long the whole thing takes.
  return Math.max(1, item.durationSeconds);
}

function libraryItemToStep(
  item: LibraryItem,
  category: Category,
): RoutineStep {
  const dur = stepTotalSeconds(item);
  const reps = Math.max(1, item.repetitions);
  const muscle = item.primaryMuscle ? `Target: ${item.primaryMuscle}.` : "";
  const equipHint = item.equipment ? ` Equipment: ${item.equipment}.` : "";

  let action: string;
  if (category === "strength") {
    action = reps > 1 ? `${reps} reps over the timer.` : "Work to the timer.";
  } else {
    // stretch — duration matters because you're holding
    action =
      reps > 1
        ? `${reps} reps — ~${Math.round(dur / reps)}s each.`
        : `Hold for ${dur}s.`;
  }
  return {
    name: item.name,
    durationSeconds: dur,
    instruction: [muscle, action].filter(Boolean).join(" ").trim() + equipHint,
  };
}

function pickLegacyRoutine(
  routines: { name: string; steps: RoutineStep[] }[],
  categoryLabel: string,
): BuiltRoutine {
  const idx = Math.floor(Math.random() * routines.length);
  const r = routines[idx];
  return {
    name: `${categoryLabel} — ${r.name}`,
    steps: r.steps,
  };
}
