import { describe, expect, it } from "vitest";
import { MAX_ENTRIES, append, formatTime, type LogEntry } from "./event-log";

const e = (n: number): LogEntry => ({ at: n, kind: "call", text: String(n) });

describe("event log", () => {
  it("appends without mutating", () => {
    const a = [e(1)];
    const b = append(a, e(2));
    expect(a).toHaveLength(1);
    expect(b.map((x) => x.text)).toEqual(["1", "2"]);
  });

  it("keeps only the newest entries", () => {
    let log: LogEntry[] = [];
    for (let i = 0; i < MAX_ENTRIES + 5; i++) log = append(log, e(i));
    expect(log).toHaveLength(MAX_ENTRIES);
    expect(log[0]!.text).toBe("5");
    expect(log.at(-1)!.text).toBe(String(MAX_ENTRIES + 4));
  });

  it("formats a time with milliseconds", () => {
    expect(formatTime(new Date(2026, 9, 20, 7, 5, 9, 42).getTime())).toBe("07:05:09.042");
  });
});
