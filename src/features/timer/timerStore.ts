import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type Category = "stretch" | "strength" | "move" | "meditate";
export type Phase = "idle" | "working" | "break";

interface TimerState {
  phase: Phase;
  secondsRemaining: number;
  workDuration: number;
  breakDuration: number;
  category: Category;

  setWorkDuration: (s: number) => void;
  setBreakDuration: (s: number) => void;
  setCategory: (c: Category) => void;

  start: () => void;
  stop: () => void;
  endBreak: () => void;
  tick: () => void;
}

export const useTimer = create<TimerState>((set, get) => ({
  phase: "idle",
  secondsRemaining: 0,
  workDuration: 45 * 60, // Change to 10 for testing
  breakDuration: 5 * 60, // Change to 20 for testing
  category: "stretch",

  setWorkDuration: (s) => set({ workDuration: s }),
  setBreakDuration: (s) => set({ breakDuration: s }),
  setCategory: (c) => set({ category: c }),

  start: () => {
    const { workDuration } = get();
    set({ phase: "working", secondsRemaining: workDuration });
  },
  stop: () => {
    set({ phase: "idle", secondsRemaining: 0 });
    invoke("dismiss_break").catch(() => {});
  },
  endBreak: () => {
    // Called when user clicks Done on the break overlay.
    // Return to idle so the user can adjust settings before the next cycle.
    set({ phase: "idle", secondsRemaining: 0 });
    invoke("dismiss_break").catch(() => {});
  },

  tick: () => {
    const { phase, secondsRemaining, breakDuration, category } = get();
    if (phase === "idle") return;

    if (secondsRemaining <= 1) {
      if (phase === "working") {
        invoke("show_break_overlay", {
          exerciseId: category,
          duration: breakDuration,
        }).catch((e) => console.error("show_break_overlay failed", e));
        set({ phase: "break", secondsRemaining: breakDuration });
      }
      // If phase is 'break' and we hit 0, we DON'T auto-close or restart.
      // The overlay handles dismissal via the Done button, which calls endBreak.
      // The break-phase timer stays at 0 and the overtime indicator pulses.
      else {
        set({ secondsRemaining: 0 });
      }
    } else {
      set({ secondsRemaining: secondsRemaining - 1 });
    }
  },
}));

export function formatTime(total: number): string {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
