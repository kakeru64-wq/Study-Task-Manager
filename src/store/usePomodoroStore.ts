import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PomodoroSession } from "@/lib/types";
import { nowISO, uid } from "@/lib/utils";

interface PomodoroState {
  sessions: PomodoroSession[];
  logSession: (s: { taskId?: string; durationMin: number; completed: boolean }) => void;
  removeSession: (id: string) => void;
  setAll: (sessions: PomodoroSession[]) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      sessions: [],
      logSession: (s) =>
        set((state) => ({
          sessions: [
            { id: uid(), startedAt: nowISO(), ...s },
            ...state.sessions,
          ],
        })),
      removeSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
      setAll: (sessions) => set({ sessions }),
    }),
    { name: "stm.pomodoro" }
  )
);
