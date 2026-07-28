/**
 * Tailwind class name combiner. Lightweight, no dependencies.
 * Usage: cn("base", condition && "active", { "border": isBordered })
 */
export function cn(...inputs: Array<string | undefined | null | false | Record<string, boolean>>): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      out.push(input);
    } else if (typeof input === "object") {
      for (const key of Object.keys(input)) {
        if (input[key]) out.push(key);
      }
    }
  }
  return out.join(" ");
}
