import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useLogStore } from "@/store/useLogStore";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DEFAULT_SETTINGS } from "@/lib/types";

export interface ExportBundle {
  version: 1;
  exportedAt: string;
  tasks: ReturnType<typeof useTaskStore.getState>["tasks"];
  projects: ReturnType<typeof useProjectStore.getState>["projects"];
  milestones: ReturnType<typeof useProjectStore.getState>["milestones"];
  logs: ReturnType<typeof useLogStore.getState>["logs"];
  sessions: ReturnType<typeof usePomodoroStore.getState>["sessions"];
  settings: ReturnType<typeof useSettingsStore.getState>["settings"];
}

export function buildExport(): ExportBundle {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: useTaskStore.getState().tasks,
    projects: useProjectStore.getState().projects,
    milestones: useProjectStore.getState().milestones,
    logs: useLogStore.getState().logs,
    sessions: usePomodoroStore.getState().sessions,
    settings: useSettingsStore.getState().settings,
  };
}

export function downloadExport(): void {
  const data = buildExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `study-tasks-${data.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBundle(raw: string): { ok: boolean; message: string } {
  try {
    const data = JSON.parse(raw) as Partial<ExportBundle>;
    if (!data || typeof data !== "object") throw new Error("形式が不正です");
    useTaskStore.getState().setAll(data.tasks ?? []);
    useProjectStore.getState().setAll(data.projects ?? [], data.milestones ?? []);
    useLogStore.getState().setAll(data.logs ?? []);
    usePomodoroStore.getState().setAll(data.sessions ?? []);
    if (data.settings) {
      useSettingsStore.getState().update({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    return { ok: true, message: "インポートが完了しました" };
  } catch (e) {
    return { ok: false, message: `インポート失敗: ${(e as Error).message}` };
  }
}

export function clearAll(): void {
  useTaskStore.getState().setAll([]);
  useProjectStore.getState().setAll([], []);
  useLogStore.getState().setAll([]);
  usePomodoroStore.getState().setAll([]);
}
