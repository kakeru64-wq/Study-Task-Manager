"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Check } from "lucide-react";
import type { Project } from "@/lib/types";
import { useProjectStore } from "@/store/useProjectStore";
import { projectProgress } from "@/lib/progress";
import { cx, fmtDate } from "@/lib/utils";
import { ProgressBar } from "./ui";

export function ProjectCard({ project }: { project: Project }) {
  const milestones = useProjectStore((s) =>
    s.milestones.filter((m) => m.projectId === project.id)
  );
  const addMilestone = useProjectStore((s) => s.addMilestone);
  const toggleMilestone = useProjectStore((s) => s.toggleMilestone);
  const removeMilestone = useProjectStore((s) => s.removeMilestone);
  const removeProject = useProjectStore((s) => s.removeProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [open, setOpen] = useState(true);
  const [msTitle, setMsTitle] = useState("");
  const [msDate, setMsDate] = useState("");

  const progress = projectProgress(milestones);

  function add() {
    if (!msTitle.trim()) return;
    addMilestone({
      projectId: project.id,
      title: msTitle.trim(),
      dueDate: msDate || undefined,
    });
    setMsTitle("");
    setMsDate("");
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-0.5 text-slate-400 hover:text-slate-600"
          aria-label="開閉"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: project.color }}
            />
            <h3 className="truncate font-semibold text-slate-800">
              {project.title}
            </h3>
            <select
              className="ml-1 rounded border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500"
              value={project.status}
              onChange={(e) =>
                updateProject(project.id, {
                  status: e.target.value as Project["status"],
                })
              }
            >
              <option value="active">進行中</option>
              <option value="paused">保留</option>
              <option value="done">完了</option>
            </select>
          </div>
          {project.description && (
            <p className="mt-1 text-sm text-slate-500">{project.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={progress} color={project.color} />
            <span className="shrink-0 text-xs font-semibold text-slate-500">
              {progress}%
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            マイルストーン {milestones.filter((m) => m.done).length}/
            {milestones.length}
          </div>
        </div>
        <button
          className="btn-ghost p-1.5 text-slate-400 hover:text-red-600"
          onClick={() => {
            if (confirm(`「${project.title}」を削除しますか？`)) removeProject(project.id);
          }}
          aria-label="プロジェクト削除"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="group flex items-center gap-2 rounded-md px-1 py-1"
              >
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className={cx(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                    m.done
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 hover:border-brand-500"
                  )}
                  aria-label="完了切替"
                >
                  {m.done && <Check size={11} />}
                </button>
                <span
                  className={cx(
                    "flex-1 text-sm",
                    m.done ? "text-slate-400 line-through" : "text-slate-700"
                  )}
                >
                  {m.title}
                </span>
                {m.dueDate && (
                  <span className="text-xs text-slate-400">{fmtDate(m.dueDate)}</span>
                )}
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="text-slate-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                  aria-label="削除"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              className="input flex-1 py-1.5"
              placeholder="マイルストーンを追加"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <input
              type="date"
              className="input w-auto py-1.5"
              value={msDate}
              onChange={(e) => setMsDate(e.target.value)}
            />
            <button className="btn-soft" onClick={add} aria-label="追加">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
