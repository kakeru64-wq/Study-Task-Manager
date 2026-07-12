"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { PRIORITY_LABEL } from "@/lib/types";
import { cx, dueInfo, fmtDate } from "@/lib/utils";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { Badge } from "./ui";

const priorityTone: Record<string, "red" | "amber" | "slate"> = {
  high: "red",
  med: "amber",
  low: "slate",
};

const dueTone: Record<string, "red" | "amber" | "blue" | "slate"> = {
  overdue: "red",
  today: "amber",
  soon: "amber",
  normal: "slate",
  none: "slate",
};

export function TaskItem({
  task,
  onEdit,
}: {
  task: Task;
  onEdit?: (t: Task) => void;
}) {
  const toggleDone = useTaskStore((s) => s.toggleDone);
  const removeTask = useTaskStore((s) => s.removeTask);
  const project = useProjectStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined
  );
  const done = task.status === "done";
  const due = dueInfo(task.dueDate);

  return (
    <div className="card flex items-center gap-3 p-3">
      <button
        onClick={() => toggleDone(task.id)}
        aria-label="完了切替"
        className={cx(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          done
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-slate-300 hover:border-brand-500"
        )}
      >
        {done && <Check size={14} />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cx(
            "truncate text-sm font-medium",
            done ? "text-slate-400 line-through" : "text-slate-800"
          )}
        >
          {task.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {project && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{ background: `${project.color}1a`, color: project.color }}
            >
              ● {project.title}
            </span>
          )}
          {task.status === "doing" && <Badge tone="blue">進行中</Badge>}
          <Badge tone={priorityTone[task.priority]}>
            優先{PRIORITY_LABEL[task.priority]}
          </Badge>
          {task.dueDate && (
            <Badge tone={dueTone[due.tone]}>
              {fmtDate(task.dueDate)}・{due.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onEdit && (
          <button
            className="btn-ghost p-1.5"
            onClick={() => onEdit(task)}
            aria-label="編集"
          >
            <Pencil size={15} />
          </button>
        )}
        <button
          className="btn-ghost p-1.5 text-slate-400 hover:text-red-600"
          onClick={() => removeTask(task.id)}
          aria-label="削除"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
