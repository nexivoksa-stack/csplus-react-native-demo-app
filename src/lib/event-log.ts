/** A small bounded log shown on the Lifecycle screen. */
export interface LogEntry {
  at: number;
  kind: "app" | "call" | "audio";
  text: string;
}

export const MAX_ENTRIES = 200;

export function append(log: readonly LogEntry[], entry: LogEntry): LogEntry[] {
  const next = [...log, entry];
  return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
}

export function formatTime(at: number): string {
  const d = new Date(at);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}
