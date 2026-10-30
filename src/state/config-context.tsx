import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONFIG, STORAGE_KEY, parseConfig, type DemoConfig } from "@/lib/config";

interface ConfigValue {
  config: DemoConfig;
  /** False until the saved config has been read, so a call is never started with defaults by mistake. */
  loaded: boolean;
  update(patch: Partial<DemoConfig>): void;
}

const Ctx = createContext<ConfigValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setConfig(parseConfig(raw)))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const update = useCallback((patch: Partial<DemoConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ config, loaded, update }), [config, loaded, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConfig(): ConfigValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfig outside ConfigProvider");
  return v;
}
