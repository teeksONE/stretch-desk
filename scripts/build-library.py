#!/usr/bin/env python3
"""
Convert stretch_desk_movements_v2.xlsx into a typed TypeScript module
at src/content/library.ts.

Usage:
    python3 scripts/build-library.py

Re-run after editing the spreadsheet to regenerate the library.
"""

from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl is required. Install with: pip3 install openpyxl")

REPO = Path(__file__).resolve().parent.parent
XLSX = REPO / "stretch_desk_movements_v2.xlsx"
OUT = REPO / "src" / "content" / "library.ts"

CLINICAL_AREAS = [
    "Cervical Flexor/Extensor Complex",
    "Axioscapular Group",
    "Scapulohumeral / Rotator Cuff Complex",
    "Pectoral / Anterior Shoulder Complex",
    "Thoracic Spine / Rib Cage Complex",
    "Lumbopelvic Core Stabiliser Complex",
    "Lumbar Extensor / Quadratus Lumborum Complex",
    "Hip Flexor Complex",
    "Gluteal / Deep Hip Rotator Complex",
    "Hamstring / Posterior Thigh Complex",
    "Hip Abductor / Adductor Complex",
    "Forearm / Wrist / Hand Complex",
    "Calf / Ankle / Foot Complex",
]

SKILL_LEVELS = ("beginner", "intermediate", "advanced", "pro")
CONTEXTS = ("Seated", "Standing", "Seated or standing", "Lying down")


def duration_to_seconds(value) -> int:
    """xlsx time cells may come through as datetime.time, datetime.timedelta,
    int/float seconds, or strings like '0:00:30'. Normalise to int seconds."""
    if value is None:
        return 0
    if isinstance(value, dt.time):
        return value.hour * 3600 + value.minute * 60 + value.second
    if isinstance(value, dt.timedelta):
        return int(value.total_seconds())
    if isinstance(value, (int, float)):
        # Excel stores times as fractions of a day if the cell is formatted as time.
        if 0 < value < 1:
            return int(round(value * 86400))
        return int(value)
    if isinstance(value, str):
        parts = value.split(":")
        try:
            parts = [int(p) for p in parts]
        except ValueError:
            return 0
        while len(parts) < 3:
            parts.insert(0, 0)
        h, m, s = parts[-3:]
        return h * 3600 + m * 60 + s
    return 0


def split_muscles(value) -> list[str]:
    if value is None:
        return []
    return [m.strip() for m in str(value).split(",") if m.strip()]


def coerce_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("true", "yes", "1")
    if isinstance(value, (int, float)):
        return bool(value)
    return False


def read_table(ws, name_field: str) -> list[dict]:
    rows = list(ws.iter_rows(values_only=True))
    header = list(rows[0])
    items = []
    for raw in rows[1:]:
        if not any(c is not None and str(c).strip() for c in raw):
            continue
        d = dict(zip(header, raw))
        area = d.get("Area of Body")
        if area not in CLINICAL_AREAS:
            print(f"  skipping row with unknown area: {area!r}", file=sys.stderr)
            continue
        skill = (d.get("Movement Skill Level") or "beginner").strip().lower()
        if skill not in SKILL_LEVELS:
            print(f"  skipping row with bad skill: {skill!r}", file=sys.stderr)
            continue
        ctx = d.get("Can Be Completed") or "Seated"
        if ctx not in CONTEXTS:
            print(f"  unexpected context, defaulting Seated: {ctx!r}", file=sys.stderr)
            ctx = "Seated"
        needs = coerce_bool(d.get("Additional Equipment Required"))
        equipment = d.get("Additional Equipment")
        hold = d.get("Hold (s)")
        try:
            hold_seconds = int(hold) if hold not in (None, "") else None
        except (TypeError, ValueError):
            hold_seconds = None
        description = d.get("Description")
        items.append({
            "area": area,
            "primaryMuscle": (d.get("Primary Target Muscle Group") or "").strip(),
            "otherMuscles": split_muscles(d.get("Other Target Muscle Groups")),
            "name": (d.get(name_field) or "").strip(),
            "durationSeconds": duration_to_seconds(d.get("Duration")),
            "repetitions": int(d.get("Repetitions") or 1),
            "holdSeconds": hold_seconds,
            "skillLevel": skill,
            "context": ctx,
            "needsEquipment": needs,
            "equipment": (str(equipment).strip() if needs and equipment else None),
            "description": (str(description).strip() if description else ""),
        })
    return items


def emit_ts(stretch: list[dict], strengthen: list[dict]) -> str:
    header = f"""// AUTO-GENERATED from stretch_desk_movements_v2.xlsx
// Do NOT edit by hand. Regenerate with: python3 scripts/build-library.py

export type ClinicalArea =
{chr(10).join(f'  | {json.dumps(a)}' for a in CLINICAL_AREAS)};

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";
export type Context = "Seated" | "Standing" | "Seated or standing" | "Lying down";

export interface LibraryItem {{
  area: ClinicalArea;
  primaryMuscle: string;
  otherMuscles: string[];
  name: string;
  durationSeconds: number;
  repetitions: number;
  holdSeconds: number | null;
  skillLevel: SkillLevel;
  context: Context;
  needsEquipment: boolean;
  equipment: string | null;
  description: string;
}}

// User-facing simplified body areas. Each maps to one or more clinical complexes.
export type UserBodyArea =
  | "neck"
  | "shoulders"
  | "chest"
  | "back"
  | "hips"
  | "legs"
  | "arms";

export const USER_AREA_TO_CLINICAL: Record<UserBodyArea, ClinicalArea[]> = {{
  neck: ["Cervical Flexor/Extensor Complex"],
  shoulders: [
    "Axioscapular Group",
    "Scapulohumeral / Rotator Cuff Complex",
  ],
  chest: ["Pectoral / Anterior Shoulder Complex"],
  back: [
    "Thoracic Spine / Rib Cage Complex",
    "Lumbar Extensor / Quadratus Lumborum Complex",
    "Lumbopelvic Core Stabiliser Complex",
  ],
  hips: [
    "Hip Flexor Complex",
    "Gluteal / Deep Hip Rotator Complex",
    "Hip Abductor / Adductor Complex",
  ],
  legs: [
    "Hamstring / Posterior Thigh Complex",
    "Calf / Ankle / Foot Complex",
  ],
  arms: ["Forearm / Wrist / Hand Complex"],
}};

export const USER_AREA_LABELS: Record<UserBodyArea, string> = {{
  neck: "Neck",
  shoulders: "Shoulders",
  chest: "Chest",
  back: "Back",
  hips: "Hips",
  legs: "Legs",
  arms: "Arms",
}};
"""

    def emit_array(name: str, items: list[dict]) -> str:
        lines = [f"\nexport const {name}: LibraryItem[] = ["]
        for it in items:
            lines.append("  {")
            lines.append(f"    area: {json.dumps(it['area'])},")
            lines.append(f"    primaryMuscle: {json.dumps(it['primaryMuscle'])},")
            lines.append(
                f"    otherMuscles: {json.dumps(it['otherMuscles'])},"
            )
            lines.append(f"    name: {json.dumps(it['name'])},")
            lines.append(f"    durationSeconds: {it['durationSeconds']},")
            lines.append(f"    repetitions: {it['repetitions']},")
            lines.append(
                f"    holdSeconds: {it['holdSeconds'] if it['holdSeconds'] is not None else 'null'},"
            )
            lines.append(f"    skillLevel: {json.dumps(it['skillLevel'])},")
            lines.append(f"    context: {json.dumps(it['context'])},")
            lines.append(f"    needsEquipment: {str(it['needsEquipment']).lower()},")
            lines.append(f"    equipment: {json.dumps(it['equipment'])},")
            lines.append(f"    description: {json.dumps(it['description'])},")
            lines.append("  },")
        lines.append("];")
        return "\n".join(lines)

    return header + emit_array("STRETCH_LIBRARY", stretch) + "\n" + emit_array("STRENGTHEN_LIBRARY", strengthen) + "\n"


def main() -> int:
    if not XLSX.exists():
        sys.exit(f"Spreadsheet not found at {XLSX}")
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    stretch = read_table(wb["Stretch movements"], "Stretch Name")
    strengthen = read_table(wb["Strength Movements"], "Movement Name")
    print(f"Stretching: {len(stretch)} items")
    print(f"Strengthening: {len(strengthen)} items")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(emit_ts(stretch, strengthen))
    print(f"Wrote {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
