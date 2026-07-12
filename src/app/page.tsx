"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ListTodo,
  CalendarClock,
  FlaskConical,
  Timer,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useHydrated } from "@/lib/useHydrated";
import {
  todaysTasks,
  upcomingTasks,
  focusMinutesToday,
  focusMinutesThisWeek,
  projectProgress,
} from "@/lib/progress";
import { dueInfo, fmtDate } from "@/lib/utils";
import { PageHeader, StatCard, ProgressBar, Badge, EmptyState } from "@/components/ui";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";
import { MobileNav } from "@/components/Sidebar";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const milestones = useProjectStore((s) => s.milestones);
  const sessions = usePomodoroStore((s) => s.sessions);
  const [open, setOpen] = useState(false);

  const today = todaysTasks(tasks);
  const upcoming = upcomingTasks(tasks, 6);
  const activeProjects = projects.filter((p) => p.status === "active");

  const stats = useMemo(() => {
    const openCount = tasks.filter((t) => t.status !== "done").length;
    const overdue = tasks.filter(
      (t) => t.status !== "done" && dueInfo(t.dueDate).tone === "overdue"
    ).length;
    return {
      openCount,
      overdue,
      todayFocus: focusMinutesToday(sessions),
      weekFocus: focusMinutesThisWeek(sessions),
    };
  }, [tasks, sessions]);

  const greeting = format(new Date(), "M月d日 (E)", { locale: ja });

  return (
    <>
      <MobileNav />
      <PageHeader
        title="ダッシュボード"
        subtitle={`${greeting} ・ 今日も少しずつ進めましょう`}
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> タスク追加
          </button>
        }
      />

      {!hydrated ? null : (
        <div className="space-y-6">
          {/* サマリ */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="未完了タスク"
              value={stats.openCount}
              icon={<ListTodo size={16} />}
            />
            <StatCard
              label="締切超過"
              value={stats.overdue}
              sub={stats.overdue > 0 ? "要対応" : "なし"}
              icon={<CalendarClock size={16} />}
            />
            <StatCard
              label="今日の集中"
              value={`${stats.todayFocus}分`}
              icon={<Timer size={16} />}
            />
            <StatCard
              label="進行中プロジェクト"
              value={activeProjects.length}
              icon={<FlaskConical size={16} />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 今日のタスク */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-500">今日のタスク</h2>
                <Link
                  href="/tasks"
                  className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  すべて見る <ArrowRight size={12} />
                </Link>
              </div>
              {today.length === 0 ? (
                <EmptyState title="今日のタスクはありません" hint="進行中・本日締切のタスクが表示されます" />
              ) : (
                <div className="space-y-2">
                  {today.map((t) => (
                    <TaskItem key={t.id} task={t} />
                  ))}
                </div>
              )}
            </section>

            {/* 直近の締切 */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-500">直近の締切</h2>
                <Link
                  href="/calendar"
                  className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  カレンダー <ArrowRight size={12} />
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <EmptyState title="締切のあるタスクはありません" />
              ) : (
                <div className="card divide-y divide-slate-100">
                  {upcoming.map((t) => {
                    const due = dueInfo(t.dueDate);
                    const tone =
                      due.tone === "overdue"
                        ? "red"
                        : due.tone === "today" || due.tone === "soon"
                        ? "amber"
                        : "slate";
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate text-slate-700">
                          {t.title}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {fmtDate(t.dueDate)}
                        </span>
                        <Badge tone={tone}>{due.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* プロジェクト進捗 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-500">研究プロジェクトの進捗</h2>
              <Link
                href="/research"
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                研究・進捗 <ArrowRight size={12} />
              </Link>
            </div>
            {activeProjects.length === 0 ? (
              <EmptyState
                icon={<FlaskConical size={32} />}
                title="進行中のプロジェクトがありません"
                hint="研究・進捗ページで登録できます"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeProjects.map((p) => {
                  const ms = milestones.filter((m) => m.projectId === p.id);
                  const prog = projectProgress(ms);
                  return (
                    <div key={p.id} className="card p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: p.color }}
                        />
                        <span className="truncate text-sm font-medium text-slate-700">
                          {p.title}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-slate-500">
                          {prog}%
                        </span>
                      </div>
                      <ProgressBar value={prog} color={p.color} />
                      <div className="mt-1.5 text-xs text-slate-400">
                        {ms.filter((m) => m.done).length}/{ms.length} マイルストーン
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 集中を始める */}
          <Link
            href="/pomodoro"
            className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 p-5 text-white transition-opacity hover:opacity-95"
          >
            <div>
              <div className="text-sm font-semibold">集中タイムを始める</div>
              <div className="text-xs text-white/80">
                今週の集中: {stats.weekFocus}分 ・ ポモドーロで作業に取りかかろう
              </div>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Timer size={22} />
            </span>
          </Link>
        </div>
      )}

      <TaskForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
