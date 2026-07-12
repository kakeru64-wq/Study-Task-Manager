import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Milestone, Project } from "@/lib/types";
import { PROJECT_COLORS } from "@/lib/types";
import { nowISO, uid } from "@/lib/utils";

interface ProjectState {
  projects: Project[];
  milestones: Milestone[];
  addProject: (p: Pick<Project, "title" | "description"> & { color?: string }) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addMilestone: (m: Omit<Milestone, "id" | "done">) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  toggleMilestone: (id: string) => void;
  removeMilestone: (id: string) => void;
  setAll: (projects: Project[], milestones: Milestone[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      milestones: [],
      addProject: (p) =>
        set((s) => ({
          projects: [
            {
              id: uid(),
              title: p.title,
              description: p.description,
              color: p.color ?? PROJECT_COLORS[s.projects.length % PROJECT_COLORS.length],
              status: "active",
              createdAt: nowISO(),
            },
            ...s.projects,
          ],
        })),
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          milestones: s.milestones.filter((m) => m.projectId !== id),
        })),
      addMilestone: (m) =>
        set((s) => ({
          milestones: [...s.milestones, { id: uid(), done: false, ...m }],
        })),
      updateMilestone: (id, patch) =>
        set((s) => ({
          milestones: s.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      toggleMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, done: !m.done } : m
          ),
        })),
      removeMilestone: (id) =>
        set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),
      setAll: (projects, milestones) => set({ projects, milestones }),
    }),
    { name: "stm.projects" }
  )
);

export function milestonesOf(projectId: string) {
  return useProjectStore.getState().milestones.filter((m) => m.projectId === projectId);
}
