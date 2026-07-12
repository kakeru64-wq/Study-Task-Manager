// アプリ全体のデータ型定義

export type Priority = "low" | "med" | "high";
export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // ISO 日付文字列 (yyyy-MM-dd)
  priority: Priority;
  status: TaskStatus;
  projectId?: string;
  createdAt: string; // ISO datetime
  completedAt?: string;
}

export type ProjectStatus = "active" | "paused" | "done";

export interface Project {
  id: string;
  title: string;
  description?: string;
  color: string; // tailwind 用の hex
  status: ProjectStatus;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string;
  done: boolean;
}

export type LogType = "paper" | "experiment" | "seminar" | "writing" | "other";

export interface ResearchLog {
  id: string;
  projectId?: string;
  date: string; // yyyy-MM-dd
  type: LogType;
  content: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  startedAt: string; // ISO datetime
  durationMin: number;
  completed: boolean;
}

export interface Settings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakEvery: number; // 何ポモドーロごとに長い休憩か
}

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
};

export const PROJECT_COLORS = [
  "#3563ff",
  "#16a34a",
  "#db2777",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  med: "中",
  low: "低",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
};

export const LOG_TYPE_LABEL: Record<LogType, string> = {
  paper: "論文",
  experiment: "実験",
  seminar: "ゼミ",
  writing: "執筆",
  other: "その他",
};
