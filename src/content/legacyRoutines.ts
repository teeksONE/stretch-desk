// Hardcoded routines for categories not covered by the auto-generated library.
// Move and Meditate aren't represented in Stretch_Desk_Comprehensive_Rehab_Library_v2.xlsx,
// so the v0.3 content is preserved here. The routine builder selects one variant
// at random per break for variety.

export type LegacyStep = {
  name: string;
  durationSeconds: number;
  instruction: string;
};

export type LegacyRoutine = {
  name: string;
  steps: LegacyStep[];
};

export const MOVE_ROUTINES: LegacyRoutine[] = [
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
        instruction: "Sit back down with a full bottle and a fresh head.",
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
        instruction: "Lap your floor or building at a relaxed pace. No phone.",
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
];

export const MEDITATE_ROUTINES: LegacyRoutine[] = [
  {
    name: "Box breathing",
    steps: [
      {
        name: "Settle",
        durationSeconds: 30,
        instruction: "Close your eyes. Sit tall. Let your shoulders drop.",
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
];
