import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@/lib/types";
import { nowISO, uid } from "@/lib/utils";

interface TaskState {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "createdAt" | "status"> & { status?: Task["status"] }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  toggleDone: (id: string) => void;
  setAll: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (t) =>
        set((s) => ({
          tasks: [
            {
              id: uid(),
              createdAt: nowISO(),
              status: t.status ?? "todo",
              ...t,
            },
            ...s.tasks,
          ],
        })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? t.status === "done"
                ? { ...t, status: "todo", completedAt: undefined }
                : { ...t, status: "done", completedAt: nowISO() }
              : t
          ),
        })),
      setAll: (tasks) => set({ tasks }),
    }),
    { name: "stm.tasks" }
  )
);
