import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResearchLog } from "@/lib/types";
import { uid } from "@/lib/utils";

interface LogState {
  logs: ResearchLog[];
  addLog: (l: Omit<ResearchLog, "id">) => void;
  updateLog: (id: string, patch: Partial<ResearchLog>) => void;
  removeLog: (id: string) => void;
  setAll: (logs: ResearchLog[]) => void;
}

export const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (l) => set((s) => ({ logs: [{ id: uid(), ...l }, ...s.logs] })),
      updateLog: (id, patch) =>
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      removeLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
      setAll: (logs) => set({ logs }),
    }),
    { name: "stm.logs" }
  )
);
