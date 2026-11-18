export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const pad2 = (value: number) => String(Math.round(value)).padStart(2, "0");

export const pad3 = (value: number) => String(Math.round(value)).padStart(3, "0");

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
}
