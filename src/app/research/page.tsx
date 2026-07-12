"use client";

import { useMemo, useState } from "react";
import { Plus, FlaskConical, Trash2 } from "lucide-react";
import type { LogType } from "@/lib/types";
import { LOG_TYPE_LABEL } from "@/lib/types";
import { useProjectStore } from "@/store/useProjectStore";
import { useLogStore } from "@/store/useLogStore";
import { useHydrated } from "@/lib/useHydrated";
import { todayISO, fmtDate } from "@/lib/utils";
import { PageHeader, EmptyState, Modal, Badge } from "@/components/ui";
import { ProjectCard } from "@/components/ProjectCard";
import { MobileNav } from "@/components/Sidebar";

export default function ResearchPage() {
  const hydrated = useHydrated();
  const projects = useProjectStore((s) => s.projects);
  const addProject = useProjectStore((s) => s.addProject);

  const logs = useLogStore((s) => s.logs);
  const addLog = useLogStore((s) => s.addLog);
  const removeLog = useLogStore((s) => s.removeLog);

  const [open, setOpen] = useState(false);
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");

  // 研究ログ入力
  const [logType, setLogType] = useState<LogType>("paper");
  const [logProject, setLogProject] = useState("");
  const [logContent, setLogContent] = useState("");
  const [logDate, setLogDate] = useState(todayISO());

  function createProject() {
    if (!pTitle.trim()) return;
    addProject({ title: pTitle.trim(), description: pDesc.trim() || undefined });
    setPTitle("");
    setPDesc("");
    setOpen(false);
  }

  function submitLog() {
    if (!logContent.trim()) return;
    addLog({
      type: logType,
      projectId: logProject || undefined,
      content: logContent.trim(),
      date: logDate,
    });
    setLogContent("");
  }

  const projectName = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => (map[p.id] = p.title));
    return map;
  }, [projects]);

  return (
    <>
      <MobileNav />
      <PageHeader
        title="研究・進捗"
        subtitle="長期プロジェクトをマイルストーンに分解し、研究ログを記録"
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> プロジェクト
          </button>
        }
      />

      {!hydrated ? null : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* プロジェクト一覧 */}
          <div className="space-y-3 lg:col-span-3">
            <h2 className="text-sm font-semibold text-slate-500">プロジェクト</h2>
            {projects.length === 0 ? (
              <EmptyState
                icon={<FlaskConical size={36} />}
                title="プロジェクトがありません"
                hint="卒論・修論・実験テーマなどを登録しましょう"
              />
            ) : (
              projects.map((p) => <ProjectCard key={p.id} project={p} />)
            )}
          </div>

          {/* 研究ログ */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-slate-500">研究ログ</h2>
            <div className="card mb-4 space-y-2 p-4">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="input py-1.5"
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as LogType)}
                >
                  {(Object.keys(LOG_TYPE_LABEL) as LogType[]).map((t) => (
                    <option key={t} value={t}>
                      {LOG_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="input py-1.5"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>
              <select
                className="input py-1.5"
                value={logProject}
                onChange={(e) => setLogProject(e.target.value)}
              >
                <option value="">プロジェクトなし</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <textarea
                className="input min-h-[60px] resize-y"
                placeholder="今日やったこと・気づき（例: 〇〇の手法をサーベイ）"
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
              />
              <button
                className="btn-primary w-full justify-center"
                onClick={submitLog}
                disabled={!logContent.trim()}
              >
                記録する
              </button>
            </div>

            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="px-1 text-sm text-slate-400">まだ記録がありません</p>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="card group p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge tone="blue">{LOG_TYPE_LABEL[l.type]}</Badge>
                      <span className="text-xs text-slate-400">{fmtDate(l.date)}</span>
                      {l.projectId && projectName[l.projectId] && (
                        <span className="text-xs text-slate-400">
                          ・{projectName[l.projectId]}
                        </span>
                      )}
                      <button
                        className="ml-auto text-slate-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                        onClick={() => removeLog(l.id)}
                        aria-label="削除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {l.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="プロジェクトを追加">
        <div className="space-y-3">
          <div>
            <label className="label">タイトル</label>
            <input
              autoFocus
              className="input"
              value={pTitle}
              onChange={(e) => setPTitle(e.target.value)}
              placeholder="例: 修士論文 / 〇〇の実験"
              onKeyDown={(e) => e.key === "Enter" && createProject()}
            />
          </div>
          <div>
            <label className="label">説明（任意）</label>
            <textarea
              className="input min-h-[60px] resize-y"
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn-soft" onClick={() => setOpen(false)}>
              キャンセル
            </button>
            <button
              className="btn-primary"
              onClick={createProject}
              disabled={!pTitle.trim()}
            >
              追加
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
