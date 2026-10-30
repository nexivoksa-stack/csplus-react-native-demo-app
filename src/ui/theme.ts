import { useColorScheme } from "react-native";

const light = { bg: "#f6f7f9", card: "#ffffff", text: "#10151c", muted: "#5b6573", line: "#dde1e7", accent: "#0b7a75", accentText: "#ffffff", danger: "#b3261e", ok: "#1b7f3b", warn: "#9a6700" };
const dark = { bg: "#0d1117", card: "#161b22", text: "#e6edf3", muted: "#8b949e", line: "#2a313a", accent: "#2ee6e6", accentText: "#06201f", danger: "#ff7b72", ok: "#56d364", warn: "#e3b341" };

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
