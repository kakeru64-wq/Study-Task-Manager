"use client";

import { useEffect, useState } from "react";
import type { Priority, Task } from "@/lib/types";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/types";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { Modal } from "./ui";

export function TaskForm({
  open,
  onClose,
  editing,
  defaultProjectId,
  defaultDueDate,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Task | null;
  defaultProjectId?: string;
  defaultDueDate?: string;
}) {
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const projects = useProjectStore((s) => s.projects);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("med");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [projectId, setProjectId] = useState("");

  // フォームを開くたびに、編集対象または初期値で各フィールドを再初期化する
  // （TaskForm は常時マウントされており、useState だけでは前回値が残ってしまうため）
  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setNotes(editing?.notes ?? "");
    setDueDate(editing?.dueDate ?? defaultDueDate ?? "");
    setPriority(editing?.priority ?? "med");
    setStatus(editing?.status ?? "todo");
    setProjectId(editing?.projectId ?? defaultProjectId ?? "");
  }, [open, editing, defaultDueDate, defaultProjectId]);

  function submit() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      status,
      projectId: projectId || undefined,
    };
    if (editing) {
      updateTask(editing.id, payload);
    } else {
      addTask(payload);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "タスクを編集" : "タスクを追加"}>
      <div className="space-y-3">
        <div>
          <label className="label">タイトル</label>
          <input
            autoFocus
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.metaKey && submit()}
            placeholder="例: レポート提出 / 論文を3本読む"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">締切</label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">優先度</label>
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {(["high", "med", "low"] as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">状態</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
            >
              {(["todo", "doing", "done"] as Task["status"][]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">プロジェクト</label>
            <select
              className="input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">なし</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">メモ</label>
          <textarea
            className="input min-h-[64px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="任意"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-soft" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn-primary" onClick={submit} disabled={!title.trim()}>
            {editing ? "保存" : "追加"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
