import type { Milestone, PomodoroSession, Task } from "./types";
import {
  parseISO,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameDay,
} from "date-fns";

// プロジェクトの進捗率（マイルストーンの完了割合 0-100）
export function projectProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.done).length;
  return Math.round((done / milestones.length) * 100);
}

// 今日のタスク（締切が今日 or 進行中）
export function todaysTasks(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) =>
      t.status !== "done" &&
      (t.status === "doing" || (t.dueDate ? isToday(parseISO(t.dueDate)) : false))
  );
}

// 直近の締切（未完了・締切あり）を期日昇順で
export function upcomingTasks(tasks: Task[], limit = 6): Task[] {
  return tasks
    .filter((t) => t.status !== "done" && t.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, limit);
}

// 今週の合計集中時間（分）
export function focusMinutesThisWeek(sessions: PomodoroSession[]): number {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return sessions
    .filter(
      (s) =>
        s.completed &&
        isWithinInterval(parseISO(s.startedAt), { start, end })
    )
    .reduce((sum, s) => sum + s.durationMin, 0);
}

export function focusMinutesToday(sessions: PomodoroSession[]): number {
  return sessions
    .filter((s) => s.completed && isToday(parseISO(s.startedAt)))
    .reduce((sum, s) => sum + s.durationMin, 0);
}

// 過去7日分の集中時間配列（古い→新しい）
export function focusByDay(
  sessions: PomodoroSession[],
  days = 7
): { date: Date; minutes: number }[] {
  const result: { date: Date; minutes: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const minutes = sessions
      .filter(
        (s) => s.completed && isSameDay(parseISO(s.startedAt), d)
      )
      .reduce((sum, s) => sum + s.durationMin, 0);
    result.push({ date: d, minutes });
  }
  return result;
}
