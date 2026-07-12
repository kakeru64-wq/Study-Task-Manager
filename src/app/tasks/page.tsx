"use client";

import { useMemo, useState } from "react";
import { Plus, ListTodo } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useHydrated } from "@/lib/useHydrated";
import { cx } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/ui";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";
import { MobileNav } from "@/components/Sidebar";

type Filter = "all" | TaskStatus;
type Sort = "due" | "priority" | "created";

const PRIORITY_ORDER: Record<string, number> = { high: 0, med: 1, low: 2 };

export default function TasksPage() {
  const hydrated = useHydrated();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("due");

  const visible = useMemo(() => {
    let list = tasks.slice();
    if (filter !== "all") list = list.filter((t) => t.status === filter);
    if (projectFilter !== "all")
      list = list.filter((t) =>
        projectFilter === "none" ? !t.projectId : t.projectId === projectFilter
      );
    list.sort((a, b) => {
      if (sort === "due") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate < b.dueDate ? -1 : 1;
      }
      if (sort === "priority")
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return list;
  }, [tasks, filter, projectFilter, sort]);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(t: Task) {
    setEditing(t);
    setOpen(true);
  }

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      doing: tasks.filter((t) => t.status === "doing").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  return (
    <>
      <MobileNav />
      <PageHeader
        title="タスク"
        subtitle="課題・締切・やることを管理"
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> タスク追加
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "todo", "doing", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filter === f
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            {f === "all" ? "すべて" : STATUS_LABEL[f]} ({counts[f]})
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <select
            className="input w-auto py-1.5"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">全プロジェクト</option>
            <option value="none">プロジェクトなし</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <select
            className="input w-auto py-1.5"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="due">締切順</option>
            <option value="priority">優先度順</option>
            <option value="created">追加順</option>
          </select>
        </div>
      </div>

      {!hydrated ? null : visible.length === 0 ? (
        <EmptyState
          icon={<ListTodo size={36} />}
          title="タスクがありません"
          hint="右上の「タスク追加」から始めましょう"
        />
      ) : (
        <div className="space-y-2">
          {visible.map((t) => (
            <TaskItem key={t.id} task={t} onEdit={openEdit} />
          ))}
        </div>
      )}

      <TaskForm open={open} onClose={() => setOpen(false)} editing={editing} />
    </>
  );
}
