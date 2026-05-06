import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { formatTime } from "../features/timer/timerStore";

type Step = { name: string; durationSeconds: number; instruction: string };
type Routine = { name: string; steps: Step[] };
type CategoryDef = { title: string; emoji: string; routines: Routine[] };

const CATEGORIES: Record<string, CategoryDef> = {
  stretch: {
    title: "Stretch",
    emoji: "🧘",
    routines: [
      {
        name: "Desk reset",
        steps: [
          {
            name: "Neck tilt — left",
            durationSeconds: 30,
            instruction:
              "Ear gently toward your left shoulder. Don't hunch your shoulder up to meet it.",
          },
          {
            name: "Neck tilt — right",
            durationSeconds: 30,
            instruction:
              "Same on the right side. Match the depth and the relaxed shoulder.",
          },
          {
            name: "Chest opener",
            durationSeconds: 30,
            instruction:
              "Clasp your hands behind your back, puff your chest out, soften your gaze upward.",
          },
          {
            name: "Seated twist — right",
            durationSeconds: 30,
            instruction:
              "Right hand to left knee, twist your shoulders, look behind you. Sit tall.",
          },
          {
            name: "Seated twist — left",
            durationSeconds: 30,
            instruction:
              "Switch sides. Left hand to right knee, twist the other way.",
          },
          {
            name: "Figure-four — right",
            durationSeconds: 30,
            instruction:
              "Left ankle on right knee, fold forward with a flat back. Feel it in your right hip.",
          },
          {
            name: "Figure-four — left",
            durationSeconds: 30,
            instruction:
              "Switch. Right ankle on left knee, same forward fold.",
          },
          {
            name: "Wrist flexors",
            durationSeconds: 30,
            instruction:
              "Arms out, palms up. Gently pull each set of fingers down with the other hand.",
          },
          {
            name: "Wrist extensors",
            durationSeconds: 30,
            instruction:
              "Flip your hands palms down. Gently pull each set of fingers down toward you.",
          },
        ],
      },
      {
        name: "Shoulders & upper back",
        steps: [
          {
            name: "Shoulder rolls — backward",
            durationSeconds: 20,
            instruction: "Slow, big circles. 10 reps.",
          },
          {
            name: "Shoulder rolls — forward",
            durationSeconds: 20,
            instruction: "Reverse direction. Another 10 slow reps.",
          },
          {
            name: "Doorway chest — right",
            durationSeconds: 30,
            instruction:
              "Forearm up the doorframe at shoulder height, step gently through. Feel the right pec open.",
          },
          {
            name: "Doorway chest — left",
            durationSeconds: 30,
            instruction: "Other side. Same gentle step-through.",
          },
          {
            name: "Upper trap — right",
            durationSeconds: 30,
            instruction:
              "Sit tall. Drop right ear toward right shoulder. Left arm reaches toward the floor.",
          },
          {
            name: "Upper trap — left",
            durationSeconds: 30,
            instruction: "Switch sides.",
          },
          {
            name: "Scapular retractions",
            durationSeconds: 30,
            instruction:
              "Pinch your shoulder blades together as if holding a pencil between them. 10 slow squeezes.",
          },
          {
            name: "Child's pose breaths",
            durationSeconds: 45,
            instruction:
              "Drop to child's pose or fold forward in your chair. Five long, slow breaths.",
          },
        ],
      },
      {
        name: "Hips & lower back",
        steps: [
          {
            name: "Cat-cow",
            durationSeconds: 45,
            instruction:
              "On all fours or seated. Inhale to arch (cow), exhale to round (cat). 10 slow cycles.",
          },
          {
            name: "Hip flexor — right",
            durationSeconds: 45,
            instruction:
              "Stand. Step right foot back into a low lunge. Press hips slightly forward — stay tall.",
          },
          {
            name: "Hip flexor — left",
            durationSeconds: 45,
            instruction: "Switch sides. Step left foot back.",
          },
          {
            name: "Hamstring — right",
            durationSeconds: 30,
            instruction:
              "Right heel on a chair. Hinge from your hips, flat back, fold forward gently.",
          },
          {
            name: "Hamstring — left",
            durationSeconds: 30,
            instruction: "Switch sides.",
          },
          {
            name: "Knees side-to-side",
            durationSeconds: 45,
            instruction:
              "Lying or seated, drop both knees slowly to one side, then the other. 10 reps.",
          },
        ],
      },
      {
        name: "Eyes & posture",
        steps: [
          {
            name: "20-20-20",
            durationSeconds: 30,
            instruction:
              "Look at something at least 20 feet away. Soften your gaze. Don't stare — let your eyes rest.",
          },
          {
            name: "Eye rolls",
            durationSeconds: 30,
            instruction: "Slow, big circles. 5 each direction. Don't force it.",
          },
          {
            name: "Chin tucks",
            durationSeconds: 30,
            instruction:
              "Slide your chin straight back, like making a double chin. 10 slow reps.",
          },
          {
            name: "Wall slides",
            durationSeconds: 45,
            instruction:
              "Back flat to a wall, arms in goal-post position. Slide them up, then down. 10 reps.",
          },
          {
            name: "Big inhale-exhale reset",
            durationSeconds: 30,
            instruction:
              "Lift your shoulders to your ears on a deep inhale. Drop them on the exhale. 5 reps.",
          },
        ],
      },
    ],
  },
  strength: {
    title: "Strength",
    emoji: "💪",
    routines: [
      {
        name: "Classic circuit",
        steps: [
          {
            name: "Seated leg raises — right",
            durationSeconds: 30,
            instruction:
              "Straighten your right leg, hold 5 seconds, lower slowly. Aim for 10 reps.",
          },
          {
            name: "Seated leg raises — left",
            durationSeconds: 30,
            instruction: "Switch legs. 10 reps, same control.",
          },
          {
            name: "Desk push-ups",
            durationSeconds: 45,
            instruction:
              "Hands on your desk, walk your feet back. 10 slow push-ups. Body in a straight line.",
          },
          {
            name: "Wall sit",
            durationSeconds: 30,
            instruction: "Back flat to the wall, knees at 90°. Hold.",
          },
          {
            name: "Calf raises",
            durationSeconds: 30,
            instruction: "Stand. Rise onto your toes, lower slow. 10 reps.",
          },
          {
            name: "Dead-bug",
            durationSeconds: 45,
            instruction:
              "Lie down. Opposite arm and leg extend out, control the return. 5 reps each side.",
          },
          {
            name: "Plank hold",
            durationSeconds: 45,
            instruction:
              "Forearms on the floor, body in a line. Hold steady, breathe.",
          },
        ],
      },
      {
        name: "Bodyweight blast",
        steps: [
          {
            name: "Bodyweight squats",
            durationSeconds: 45,
            instruction: "10 squats. Slow down, fast up. Knees track over toes.",
          },
          {
            name: "Desk push-ups",
            durationSeconds: 45,
            instruction: "10 push-ups against your desk.",
          },
          {
            name: "Jumping jacks",
            durationSeconds: 30,
            instruction: "Or step-jacks if you'd rather not jump.",
          },
          {
            name: "Reverse lunges — right",
            durationSeconds: 30,
            instruction:
              "Step the right leg back, drop the back knee. 10 reps.",
          },
          {
            name: "Reverse lunges — left",
            durationSeconds: 30,
            instruction: "Switch sides. 10 reps.",
          },
          {
            name: "Plank",
            durationSeconds: 45,
            instruction: "Forearms down, hold the line.",
          },
        ],
      },
      {
        name: "Posture fix",
        steps: [
          {
            name: "Chin tucks",
            durationSeconds: 30,
            instruction: "Slide chin straight back. 10 reps.",
          },
          {
            name: "Face pulls",
            durationSeconds: 45,
            instruction:
              "Pretend to grab a band at face height. Pull your elbows back, squeeze shoulder blades. 15 reps.",
          },
          {
            name: "Wall slides",
            durationSeconds: 45,
            instruction:
              "Back flat to a wall, arms in goal-post. Slide up, slide down. 10 reps.",
          },
          {
            name: "Glute bridges",
            durationSeconds: 45,
            instruction:
              "Lie down, knees bent. Lift hips, squeeze, lower. 10 reps.",
          },
          {
            name: "Superman hold",
            durationSeconds: 30,
            instruction:
              "Lie face down. Lift arms and legs slightly off the ground. Hold.",
          },
        ],
      },
      {
        name: "Core focus",
        steps: [
          {
            name: "Bird-dog — right",
            durationSeconds: 45,
            instruction:
              "On all fours. Right arm and left leg extend. 10 slow reps, eyes down.",
          },
          {
            name: "Bird-dog — left",
            durationSeconds: 45,
            instruction: "Switch. Left arm and right leg.",
          },
          {
            name: "Plank",
            durationSeconds: 45,
            instruction: "Forearms down. Hold the line.",
          },
          {
            name: "Dead-bug — right",
            durationSeconds: 30,
            instruction:
              "Lie down. Right arm and left leg extend, return. 10 reps.",
          },
          {
            name: "Dead-bug — left",
            durationSeconds: 30,
            instruction: "Switch sides.",
          },
          {
            name: "Side plank — right",
            durationSeconds: 30,
            instruction: "On your right elbow, lift your hips.",
          },
          {
            name: "Side plank — left",
            durationSeconds: 30,
            instruction: "Switch sides.",
          },
          {
            name: "Standing knee raises",
            durationSeconds: 30,
            instruction:
              "Stand. Drive each knee up to hip height. 10 each side.",
          },
        ],
      },
    ],
  },
  move: {
    title: "Move",
    emoji: "🚶",
    routines: [
      {
        name: "Water run",
        steps: [
          {
            name: "Stand",
            durationSeconds: 15,
            instruction: "Up and out of the chair. Stretch your arms overhead.",
          },
          {
            name: "Walk to water",
            durationSeconds: 90,
            instruction:
              "Walk to the farthest water source in your building. Take stairs if there are any.",
          },
          {
            name: "Refill",
            durationSeconds: 30,
            instruction: "Fill up your bottle. Take a drink.",
          },
          {
            name: "Walk back",
            durationSeconds: 90,
            instruction: "Same route back. No phone.",
          },
          {
            name: "Settle",
            durationSeconds: 15,
            instruction:
              "Sit back down with a full bottle and a fresh head.",
          },
        ],
      },
      {
        name: "Floor lap",
        steps: [
          {
            name: "Stand",
            durationSeconds: 15,
            instruction: "Up. Roll your shoulders.",
          },
          {
            name: "Walk a lap",
            durationSeconds: 180,
            instruction:
              "Lap your floor or building at a relaxed pace. No phone.",
          },
          {
            name: "Notice",
            durationSeconds: 30,
            instruction:
              "Pause. Notice three things you haven't noticed before.",
          },
          {
            name: "Settle",
            durationSeconds: 15,
            instruction: "Sit back down.",
          },
        ],
      },
      {
        name: "Fresh air",
        steps: [
          {
            name: "Stand",
            durationSeconds: 15,
            instruction: "Up. Find your shoes if you need them.",
          },
          {
            name: "Walk outside",
            durationSeconds: 60,
            instruction: "Get out the door. Even just to the threshold counts.",
          },
          {
            name: "Breathe",
            durationSeconds: 90,
            instruction:
              "Five slow breaths. Sun, wind, or rain — feel it on your face.",
          },
          {
            name: "Walk back",
            durationSeconds: 60,
            instruction: "Head back inside.",
          },
          {
            name: "Settle",
            durationSeconds: 15,
            instruction: "Sit. Eyes soft.",
          },
        ],
      },
      {
        name: "Stairs",
        steps: [
          {
            name: "Stand",
            durationSeconds: 15,
            instruction:
              "Up. Find a stairwell, or just clear space if you don't have one.",
          },
          {
            name: "Climb up",
            durationSeconds: 90,
            instruction:
              "Three flights at a relaxed pace. (Or march in place, knees high.)",
          },
          {
            name: "Pause at the top",
            durationSeconds: 15,
            instruction: "Stop. Catch a breath.",
          },
          {
            name: "Climb down",
            durationSeconds: 90,
            instruction: "Same pace coming down. Watch your step.",
          },
          {
            name: "Settle",
            durationSeconds: 15,
            instruction: "Sit back at your desk.",
          },
        ],
      },
    ],
  },
  meditate: {
    title: "Meditate",
    emoji: "🌿",
    routines: [
      {
        name: "Box breathing",
        steps: [
          {
            name: "Settle",
            durationSeconds: 30,
            instruction:
              "Close your eyes. Sit tall. Let your shoulders drop.",
          },
          {
            name: "Round 1",
            durationSeconds: 60,
            instruction:
              "In for 4, hold 4, out for 4, hold 4. Count silently.",
          },
          {
            name: "Round 2",
            durationSeconds: 60,
            instruction:
              "Continue the pattern. If your mind wanders, return to the count without judgment.",
          },
          {
            name: "Round 3",
            durationSeconds: 60,
            instruction:
              "Same rhythm. Notice the pause at the top and bottom of each breath.",
          },
          {
            name: "Open",
            durationSeconds: 30,
            instruction:
              "Soften the count. Let the breath find its own rhythm. Open your eyes.",
          },
        ],
      },
      {
        name: "Body scan",
        steps: [
          {
            name: "Settle",
            durationSeconds: 30,
            instruction:
              "Close your eyes. Two slow breaths to land in the chair.",
          },
          {
            name: "Head & face",
            durationSeconds: 45,
            instruction:
              "Bring attention to the top of your head, then forehead, then jaw. Soften each.",
          },
          {
            name: "Shoulders & chest",
            durationSeconds: 45,
            instruction:
              "Notice your shoulders. Are they up by your ears? Let them drop. Two breaths into your chest.",
          },
          {
            name: "Belly & hips",
            durationSeconds: 45,
            instruction:
              "Belly soft. Notice the weight of your hips in the chair.",
          },
          {
            name: "Legs & feet",
            durationSeconds: 45,
            instruction:
              "Down through your thighs, knees, calves, feet on the floor.",
          },
          {
            name: "Whole body",
            durationSeconds: 30,
            instruction:
              "One breath that fills the whole body. Open your eyes when you're ready.",
          },
        ],
      },
      {
        name: "5-4-3-2-1 grounding",
        steps: [
          {
            name: "Settle",
            durationSeconds: 15,
            instruction: "Open your senses. Sit tall.",
          },
          {
            name: "5 things you can see",
            durationSeconds: 60,
            instruction:
              "Look around. Five separate things. Take a breath after each.",
          },
          {
            name: "4 things you can hear",
            durationSeconds: 45,
            instruction:
              "Close your eyes. Four separate sounds. Some far, some near.",
          },
          {
            name: "3 things you can feel",
            durationSeconds: 45,
            instruction:
              "Notice three things touching your skin — chair, clothes, air.",
          },
          {
            name: "2 things you can smell",
            durationSeconds: 30,
            instruction:
              "Two scents — even faint ones. Coffee, paper, the room.",
          },
          {
            name: "1 thing you can taste",
            durationSeconds: 30,
            instruction: "One taste in your mouth right now.",
          },
          {
            name: "Whole field",
            durationSeconds: 15,
            instruction: "All of it together. Breathe. Open your eyes.",
          },
        ],
      },
      {
        name: "Single-point focus",
        steps: [
          {
            name: "Pick an object",
            durationSeconds: 30,
            instruction:
              "Find one object near you — a plant, a mug, a corner of the ceiling.",
          },
          {
            name: "Shape",
            durationSeconds: 60,
            instruction: "Study its shape. The outline. Where it ends.",
          },
          {
            name: "Colour & texture",
            durationSeconds: 60,
            instruction:
              "Where the colour shifts. Smooth or rough. Light or dark.",
          },
          {
            name: "Light",
            durationSeconds: 60,
            instruction: "How light falls on it. Where the shadow sits.",
          },
          {
            name: "Whole",
            durationSeconds: 30,
            instruction:
              "Take it in as a whole. When the mind drifts, return.",
          },
        ],
      },
    ],
  },
};

function pickNextIndex(categoryId: string, count: number): number {
  if (count <= 1) return 0;
  const key = `last-routine-${categoryId}`;
  let last = -1;
  try {
    const v = localStorage.getItem(key);
    if (v !== null) {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) last = n;
    }
  } catch {
    last = -1;
  }
  return (last + 1) % count;
}

function saveRoutineIndex(categoryId: string, index: number): void {
  try {
    localStorage.setItem(`last-routine-${categoryId}`, String(index));
  } catch {
    // ignore — picking still works without persistence
  }
}

export default function BreakOverlay() {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = exerciseId ?? "stretch";
  const category = CATEGORIES[categoryId] ?? CATEGORIES.stretch;

  // Pick once at mount; don't recompute on every re-render.
  const [routineIndex] = useState(() =>
    pickNextIndex(categoryId, category.routines.length),
  );
  const routine = category.routines[routineIndex];

  // Persist the cursor advance after we've committed to this routine.
  useEffect(() => {
    saveRoutineIndex(categoryId, routineIndex);
  }, [categoryId, routineIndex]);

  const breakDuration = parseInt(searchParams.get("duration") ?? "300", 10);

  const [secondsRemaining, setSecondsRemaining] = useState(breakDuration);
  const [secondsOpen, setSecondsOpen] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(
    routine.steps[0]?.durationSeconds ?? 0,
  );

  // Overall break clock + dismiss-lockout clock.
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsOpen((n) => n + 1);
      setSecondsRemaining((n) => Math.max(0, n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Per-step countdown that auto-advances when the step ends.
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
  const progressPct = allDone
    ? 100
    : Math.round((stepIndex / totalSteps) * 100);

  // The break window is a separate webview, so we can't call endBreak()
  // on the main window's store directly. Instead, Rust's finish_break
  // closes this window and emits an event the main window listens for.
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
      <div className="text-5xl mb-3">{category.emoji}</div>
      <div className="text-xs uppercase tracking-widest text-muted mb-2">
        Break Time
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <h1 className="text-3xl font-semibold">{category.title}</h1>
        <span className="text-base text-muted">— {routine.name}</span>
      </div>

      <div className="text-xs text-muted mb-4">
        {allDone ? "Routine complete" : `Step ${stepIndex + 1} of ${totalSteps}`}
      </div>
      <div className="w-full max-w-xl h-1 bg-surface rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {!allDone && currentStep ? (
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
