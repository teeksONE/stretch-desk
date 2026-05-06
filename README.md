# Stretch Desk

A desk-break timer for macOS. Schedules work intervals, then takes over your screen with a guided routine — stretches, strength, movement, or meditation — so you actually take the break.

**Current version:** `0.3.0` — universal Apple Silicon + Intel binary, unsigned.

---

## What it does

Pick a category. Hit Start. Work for your chosen duration. A configurable number of seconds before the break (default 10s), a small countdown pill appears in the corner of your active monitor with a chime. When the work timer hits zero, a screen-covering overlay opens with a guided routine — auto-advancing through 5–9 short, named steps. When the routine ends, hit Done; the main timer comes back.

The break overlay is **deliberately not macOS native fullscreen** — that creates a new Space and triggers a system feedback sound when summoned mid-Mission-Control. Instead it's a borderless, always-on-top window sized to the active monitor. Trade-off: the macOS menu bar stays visible at the top.

## UI / UX shell

- **Main window** — small (800×600). Category buttons, work/break duration summary, Start/Stop. **Hidden while a break overlay is up**, so the 10s anti-skip lockout can't be bypassed by clicking Stop on the still-visible timer.
- **Settings page** — preset buttons for work duration (15/25/45/60/90 min), break duration (5/7/10/15 min), and pre-break warning lead time (Off/5s/10s/30s). Persists across launches via `localStorage`.
- **Warning pill** — 240×72 always-on-top window in the top-right of the cursor's monitor. Counts down with a one-shot chime synthesised from a pre-rendered `AudioBuffer` (no scheduled audio events, immune to the AudioContext suspend/resume bugs that plagued earlier versions in Mission Control).
- **Break overlay** — covers the active monitor. Header shows category + routine name. Step counter + thin progress bar. Big step name, instruction, large per-step countdown, manual "Next step →" affordance. Auto-advances on step timer expiry. "Routine complete" state when all steps done. Done button locked for the first 10 seconds to discourage impulse-skip; Skip button confirms before dismissing.

## Categories & routines

Four categories, each with four routines that round-robin across breaks (cursor stored in `localStorage`). Routines are sized to ≈3–5 minutes total; the user-set break duration is now advisory — overall countdown shows green/pulse if it runs out before the routine finishes.

- **Stretch** — Desk reset · Shoulders & upper back · Hips & lower back · Eyes & posture
- **Strength** — Classic circuit · Bodyweight blast · Posture fix · Core focus
- **Move** — Water run · Floor lap · Fresh air · Stairs
- **Meditate** — Box breathing · Body scan · 5-4-3-2-1 grounding · Single-point focus

## Tech

- **Tauri 2** (Rust desktop shell, three webviews: `main`, `break`, `warning`)
- **React 19** + **TypeScript** + **Vite 7**
- **Zustand 5** with `persist` middleware (`localStorage`, key `stretch-desk:timer-v1`, version 1)
- **react-router-dom 7** with `HashRouter` for in-webview navigation
- **Tailwind CSS 3** with a custom dark palette
- **Web Audio API** for the chime

Window lifecycle is coordinated from Rust ([src-tauri/src/lib.rs](src-tauri/src/lib.rs)): the break and warning webviews are summoned via `invoke` calls from the main webview's timer store, dismissed via Tauri events back to main. The break overlay picks its target monitor based on the cursor's current position.

## Build & distribute

```bash
npm install
npm run tauri dev          # local dev
npm run dist               # universal aarch64 + x86_64 .dmg + .app
```

Distribution artifact: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/stretch-desk_<version>_universal.dmg`.

Currently **unsigned** — testers will hit Gatekeeper on first launch and need to either right-click → Open or run `xattr -dr com.apple.quarantine /Applications/stretch-desk.app`.

## Known limitations

- macOS menu bar visible at the top of the break overlay (intentional — see above).
- Unsigned: Gatekeeper warning on first launch on any clean machine.
- No tray icon, no idle detection, no streak/history tracking, no auto-start at login.
- Settings persist across launches; in-flight session state (current phase, secondsRemaining) deliberately does not.
