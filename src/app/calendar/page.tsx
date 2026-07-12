"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useHydrated } from "@/lib/useHydrated";
import { cx, fmtDate } from "@/lib/utils";
import { PageHeader, Badge } from "@/components/ui";
import { TaskForm } from "@/components/TaskForm";
import { MobileNav } from "@/components/Sidebar";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

interface DayItem {
  kind: "task" | "milestone";
  id: string;
  title: string;
  color: string;
  done: boolean;
}

export default function CalendarPage() {
  const hydrated = useHydrated();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const milestones = useProjectStore((s) => s.milestones);

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const projColor = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach((p) => (m[p.id] = p.color));
    return m;
  }, [projects]);

  // 日付(yyyy-MM-dd) -> アイテム配列
  const byDate = useMemo(() => {
    const map: Record<string, DayItem[]> = {};
    const push = (date: string | undefined, item: DayItem) => {
      if (!date) return;
      (map[date] ??= []).push(item);
    };
    tasks.forEach((t) =>
      push(t.dueDate, {
        kind: "task",
        id: t.id,
        title: t.title,
        color: t.projectId ? projColor[t.projectId] ?? "#3563ff" : "#3563ff",
        done: t.status === "done",
      })
    );
    milestones.forEach((m) =>
      push(m.dueDate, {
        kind: "milestone",
        id: m.id,
        title: `◇ ${m.title}`,
        color: projColor[m.projectId] ?? "#7c3aed",
        done: m.done,
      })
    );
    return map;
  }, [tasks, milestones, projColor]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const selectedItems = selected ? byDate[selected] ?? [] : [];

  return (
    <>
      <MobileNav />
      <PageHeader
        title="カレンダー"
        subtitle="締切とマイルストーンを一覧"
        action={
          <div className="flex items-center gap-1">
            <button
              className="btn-ghost p-2"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              aria-label="前の月"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="w-28 text-center text-sm font-semibold text-slate-700">
              {format(cursor, "yyyy年 M月", { locale: ja })}
            </span>
            <button
              className="btn-ghost p-2"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label="次の月"
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="btn-soft ml-1"
              onClick={() => setCursor(startOfMonth(new Date()))}
            >
              今日
            </button>
          </div>
        }
      />

      {!hydrated ? null : (
        <>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-medium text-slate-500">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={cx(
                    "py-2",
                    i === 5 && "text-blue-500",
                    i === 6 && "text-red-500"
                  )}
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const items = byDate[key] ?? [];
                const inMonth = isSameMonth(day, cursor);
                const today = isToday(day);
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={cx(
                      "min-h-[84px] border-b border-r border-slate-100 p-1.5 text-left align-top transition-colors hover:bg-slate-50",
                      !inMonth && "bg-slate-50/60 text-slate-300",
                      selected === key && "ring-2 ring-inset ring-brand-400"
                    )}
                  >
                    <div
                      className={cx(
                        "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        today ? "bg-brand-600 text-white" : "text-slate-600",
                        !inMonth && "text-slate-300"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((it) => (
                        <div
                          key={it.kind + it.id}
                          className={cx(
                            "truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                            it.done && "opacity-40 line-through"
                          )}
                          style={{
                            background: `${it.color}1a`,
                            color: it.color,
                          }}
                        >
                          {it.title}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="px-1 text-[10px] text-slate-400">
                          +{items.length - 3} 件
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="card mt-4 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays size={16} className="text-brand-600" />
                <h3 className="font-semibold text-slate-800">
                  {fmtDate(selected)}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedItems.length} 件
                </span>
                <button
                  className="btn-primary ml-auto py-1.5"
                  onClick={() => setFormOpen(true)}
                >
                  <Plus size={15} /> この日にタスクを追加
                </button>
              </div>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-slate-400">
                  予定はありません。「この日にタスクを追加」から登録できます。
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((it) => (
                    <div
                      key={it.kind + it.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: it.color }}
                      />
                      <span
                        className={cx(it.done && "text-slate-400 line-through")}
                      >
                        {it.title}
                      </span>
                      <Badge tone="slate">
                        {it.kind === "task" ? "タスク" : "マイルストーン"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selected && (
            <p className="mt-4 text-center text-sm text-slate-400">
              日付をクリックすると、その日の予定確認とタスク追加ができます。
            </p>
          )}

          <TaskForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            defaultDueDate={selected ?? undefined}
          />
        </>
      )}
    </>
  );
}
