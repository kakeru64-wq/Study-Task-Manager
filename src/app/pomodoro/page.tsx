"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Timer } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useHydrated } from "@/lib/useHydrated";
import { focusByDay, focusMinutesThisWeek, focusMinutesToday } from "@/lib/progress";
import { cx, mmss } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/ui";
import { MobileNav } from "@/components/Sidebar";

type Mode = "focus" | "short" | "long";

const MODE_LABEL: Record<Mode, string> = {
  focus: "集中",
  short: "小休憩",
  long: "長休憩",
};

export default function PomodoroPage() {
  const hydrated = useHydrated();
  const settings = useSettingsStore((s) => s.settings);
  const logSession = usePomodoroStore((s) => s.logSession);
  const sessions = usePomodoroStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);

  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMin * 60);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [taskId, setTaskId] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durationFor = (m: Mode) =>
    (m === "focus"
      ? settings.focusMin
      : m === "short"
      ? settings.shortBreakMin
      : settings.longBreakMin) * 60;

  // モード切替時に残り秒をリセット（停止中のみ追従）
  function switchMode(m: Mode) {
    setMode(m);
    setRunning(false);
    setSecondsLeft(durationFor(m));
  }

  // 設定変更が現在モードに反映されるように（停止時）
  useEffect(() => {
    if (!running) setSecondsLeft(durationFor(mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMin, settings.shortBreakMin, settings.longBreakMin]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // カウント0で完了処理
  useEffect(() => {
    if (secondsLeft > 0) return;
    setRunning(false);
    if (mode === "focus") {
      logSession({
        taskId: taskId || undefined,
        durationMin: settings.focusMin,
        completed: true,
      });
      const next = completedFocus + 1;
      setCompletedFocus(next);
      const goLong = next % settings.longBreakEvery === 0;
      switchMode(goLong ? "long" : "short");
    } else {
      switchMode("focus");
    }
    // 完了通知（音が出せない環境でも害なし）
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        new Notification("ポモドーロ", {
          body: mode === "focus" ? "集中時間が終了！休憩しましょう" : "休憩終了！再開しましょう",
        });
      } catch {
        /* 通知未許可は無視 */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const total = durationFor(mode);
  const pct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  const todayMin = useMemo(
    () => (hydrated ? focusMinutesToday(sessions) : 0),
    [sessions, hydrated]
  );
  const weekMin = useMemo(
    () => (hydrated ? focusMinutesThisWeek(sessions) : 0),
    [sessions, hydrated]
  );
  const byDay = useMemo(
    () => (hydrated ? focusByDay(sessions, 7) : []),
    [sessions, hydrated]
  );
  const maxDay = Math.max(60, ...byDay.map((d) => d.minutes));

  const openTasks = tasks.filter((t) => t.status !== "done");

  const ringColor =
    mode === "focus" ? "#3563ff" : mode === "short" ? "#16a34a" : "#7c3aed";

  return (
    <>
      <MobileNav />
      <PageHeader title="ポモドーロ" subtitle="集中と休憩のサイクルで作業を進める" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* タイマー */}
        <div className="card flex flex-col items-center p-6">
          <div className="mb-5 flex gap-1.5">
            {(["focus", "short", "long"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cx(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  mode === m
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          <div className="relative h-56 w-56">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={ringColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={(2 * Math.PI * 45 * (100 - pct)) / 100}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums text-slate-800">
                {mmss(Math.max(0, secondsLeft))}
              </span>
              <span className="mt-1 text-sm text-slate-400">{MODE_LABEL[mode]}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              className="btn-primary px-5 py-2.5"
              onClick={() => setRunning((r) => !r)}
            >
              {running ? <Pause size={18} /> : <Play size={18} />}
              {running ? "一時停止" : "開始"}
            </button>
            <button
              className="btn-soft px-3 py-2.5"
              onClick={() => switchMode(mode)}
              aria-label="リセット"
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="btn-soft px-3 py-2.5"
              onClick={() => setSecondsLeft(0)}
              aria-label="スキップ"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="mt-5 w-full max-w-xs">
            <label className="label">取り組むタスク（任意）</label>
            <select
              className="input"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            >
              <option value="">選択しない</option>
              {openTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            今回のセッションで完了した集中: {completedFocus} 回
          </p>
        </div>

        {/* 集中時間の統計 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="今日の集中"
              value={`${todayMin}分`}
              sub={`${(todayMin / 60).toFixed(1)} 時間`}
              icon={<Timer size={16} />}
            />
            <StatCard
              label="今週の集中"
              value={`${weekMin}分`}
              sub={`${(weekMin / 60).toFixed(1)} 時間`}
              icon={<Timer size={16} />}
            />
          </div>

          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-500">
              過去7日間の集中時間
            </h3>
            <div className="flex h-40 items-end justify-between gap-2">
              {byDay.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-brand-500 transition-all"
                      style={{
                        height: `${(d.minutes / maxDay) * 100}%`,
                        minHeight: d.minutes > 0 ? 4 : 0,
                      }}
                      title={`${d.minutes}分`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {d.date.getMonth() + 1}/{d.date.getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
