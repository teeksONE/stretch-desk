import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import { playChime } from "./chime";
import type { SkillLevel, UserBodyArea } from "../../content/library";

export type Category = "stretch" | "strength" | "move" | "meditate";
export type Phase = "idle" | "working" | "break";

export type Workspace = "seated" | "standing-ok";

export interface Profile {
  areasOfFocus: UserBodyArea[];
  skillLevel: SkillLevel;
  workspace: Workspace;
  canLieDown: boolean;
  equipment: string[];
  onboardingComplete: boolean;
}

export const DEFAULT_PROFILE: Profile = {
  areasOfFocus: [],
  skillLevel: "beginner",
  workspace: "standing-ok",
  canLieDown: false,
  equipment: [],
  onboardingComplete: false,
};

interface TimerState {
  phase: Phase;
  secondsRemaining: number;
  workDuration: number;
  breakDuration: number;
  category: Category;
  warningLeadTime: number;
  profile: Profile;

  setWorkDuration: (s: number) => void;
  setBreakDuration: (s: number) => void;
  setCategory: (c: Category) => void;
  setWarningLeadTime: (s: number) => void;

  setProfileAreasOfFocus: (areas: UserBodyArea[]) => void;
  setProfileSkillLevel: (level: SkillLevel) => void;
  setProfileWorkspace: (workspace: Workspace) => void;
  setProfileCanLieDown: (canLieDown: boolean) => void;
  setProfileEquipment: (items: string[]) => void;
  toggleProfileEquipment: (item: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  start: () => void;
  stop: () => void;
  endBreak: () => void;
  tick: () => void;
}

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      phase: "idle",
      secondsRemaining: 0,
      workDuration: 20, // Change to 10 for testing
      breakDuration: 5 * 60, // Change to 20 for testing
      category: "stretch",
      warningLeadTime: 10,
      profile: DEFAULT_PROFILE,

      setWorkDuration: (s) => set({ workDuration: s }),
      setBreakDuration: (s) => set({ breakDuration: s }),
      setCategory: (c) => set({ category: c }),
      setWarningLeadTime: (s) => set({ warningLeadTime: s }),

      setProfileAreasOfFocus: (areas) =>
        set((s) => ({ profile: { ...s.profile, areasOfFocus: areas } })),
      setProfileSkillLevel: (level) =>
        set((s) => ({ profile: { ...s.profile, skillLevel: level } })),
      setProfileWorkspace: (workspace) =>
        set((s) => ({ profile: { ...s.profile, workspace } })),
      setProfileCanLieDown: (canLieDown) =>
        set((s) => ({ profile: { ...s.profile, canLieDown } })),
      setProfileEquipment: (items) =>
        set((s) => ({ profile: { ...s.profile, equipment: items } })),
      toggleProfileEquipment: (item) =>
        set((s) => ({
          profile: {
            ...s.profile,
            equipment: s.profile.equipment.includes(item)
              ? s.profile.equipment.filter((e) => e !== item)
              : [...s.profile.equipment, item],
          },
        })),
      completeOnboarding: () =>
        set((s) => ({ profile: { ...s.profile, onboardingComplete: true } })),
      resetOnboarding: () =>
        set((s) => ({ profile: { ...s.profile, onboardingComplete: false } })),

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
        const {
          phase,
          secondsRemaining,
          breakDuration,
          category,
          warningLeadTime,
        } = get();
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
          const next = secondsRemaining - 1;
          set({ secondsRemaining: next });
          if (
            phase === "working" &&
            warningLeadTime > 0 &&
            next === warningLeadTime
          ) {
            playChime();
            invoke("show_warning_pill", { seconds: warningLeadTime }).catch(
              () => {},
            );
          }
        }
      },
    }),
    {
      name: "stretch-desk:timer-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist user-facing settings. phase/secondsRemaining are
      // session-scoped — resuming a break that "fired" hours ago is wrong.
      partialize: (state) => ({
        workDuration: state.workDuration,
        breakDuration: state.breakDuration,
        category: state.category,
        warningLeadTime: state.warningLeadTime,
        profile: state.profile,
      }),
    },
  ),
);

export function formatTime(total: number): string {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
