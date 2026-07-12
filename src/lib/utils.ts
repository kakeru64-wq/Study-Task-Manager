import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isPast,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";

// 簡易ID生成（ローカル専用なので衝突確率は十分低い）
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function fmtDate(iso?: string): string {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "M月d日(E)", { locale: ja });
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "M/d HH:mm", { locale: ja });
  } catch {
    return iso;
  }
}

// 締切までの相対表現と緊急度
export function dueInfo(dueDate?: string): {
  label: string;
  tone: "overdue" | "today" | "soon" | "normal" | "none";
} {
  if (!dueDate) return { label: "", tone: "none" };
  const d = parseISO(dueDate);
  if (isToday(d)) return { label: "今日", tone: "today" };
  if (isTomorrow(d)) return { label: "明日", tone: "soon" };
  if (isPast(d) && !isToday(d)) {
    const days = Math.abs(differenceInCalendarDays(startOfDay(d), startOfDay(new Date())));
    return { label: `${days}日超過`, tone: "overdue" };
  }
  const days = differenceInCalendarDays(startOfDay(d), startOfDay(new Date()));
  return { label: `あと${days}日`, tone: days <= 3 ? "soon" : "normal" };
}

export function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
