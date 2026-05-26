// Canonical equipment list shown to the user during onboarding/settings.
// Library items reference equipment via free text (e.g. "Tennis ball or towel"),
// which we match heuristically in `libraryEquipmentSatisfied`.

export type Equipment =
  | "towel"
  | "tennis-ball"
  | "resistance-band"
  | "foam-roller"
  | "yoga-mat";

export interface EquipmentOption {
  id: Equipment;
  label: string;
  hint?: string;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: "towel", label: "Towel", hint: "Anything rollable works" },
  { id: "tennis-ball", label: "Tennis ball", hint: "Or any small firm ball" },
  { id: "resistance-band", label: "Resistance band" },
  { id: "foam-roller", label: "Foam roller" },
  { id: "yoga-mat", label: "Yoga mat or block" },
];

// Map a library item's free-text equipment field against the user's owned set.
// Treats free-text alternatives ("X or Y") as satisfied if the user has any one.
// Returns true (item permitted) when the requirement text is unrecognised so we
// don't over-filter — better to surface a borderline match than hide content.
export function libraryEquipmentSatisfied(
  itemEquipment: string | null,
  userEquipment: string[],
): boolean {
  if (!itemEquipment) return true;
  const text = itemEquipment.toLowerCase();
  const required: Equipment[] = [];
  if (text.includes("towel")) required.push("towel");
  if (text.includes("tennis") || text.includes(" ball"))
    required.push("tennis-ball");
  if (text.includes("band")) required.push("resistance-band");
  if (text.includes("roller")) required.push("foam-roller");
  if (text.includes("mat") || text.includes("block") || text.includes("yoga"))
    required.push("yoga-mat");
  if (required.length === 0) return true;
  return required.some((r) => userEquipment.includes(r));
}
