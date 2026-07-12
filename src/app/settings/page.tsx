"use client";

import { useRef, useState } from "react";
import { Download, Upload, Trash2, RotateCcw } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useHydrated } from "@/lib/useHydrated";
import { downloadExport, importBundle, clearAll } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { MobileNav } from "@/components/Sidebar";

export default function SettingsPage() {
  const hydrated = useHydrated();
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const reset = useSettingsStore((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function num(v: string, min: number) {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? min : Math.max(min, n);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importBundle(String(reader.result));
      setMessage(res.message);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const fields: { key: keyof typeof settings; label: string; min: number; unit: string }[] = [
    { key: "focusMin", label: "集中時間", min: 1, unit: "分" },
    { key: "shortBreakMin", label: "小休憩", min: 1, unit: "分" },
    { key: "longBreakMin", label: "長休憩", min: 1, unit: "分" },
    { key: "longBreakEvery", label: "長休憩の間隔", min: 1, unit: "回ごと" },
  ];

  return (
    <>
      <MobileNav />
      <PageHeader title="設定" subtitle="ポモドーロとデータ管理" />

      {!hydrated ? null : (
        <div className="space-y-6">
          {/* ポモドーロ設定 */}
          <section className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-600">
              ポモドーロ
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={f.min}
                      className="input"
                      value={settings[f.key]}
                      onChange={(e) =>
                        update({ [f.key]: num(e.target.value, f.min) })
                      }
                    />
                    <span className="shrink-0 text-xs text-slate-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-ghost mt-4 px-2" onClick={reset}>
              <RotateCcw size={15} /> 既定値に戻す
            </button>
          </section>

          {/* データ管理 */}
          <section className="card p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-600">データ管理</h2>
            <p className="mb-4 text-xs text-slate-400">
              すべてのデータはこの端末のブラウザ内（localStorage）に保存されます。
              バックアップや端末移行にはエクスポートをご利用ください。
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-soft" onClick={downloadExport}>
                <Download size={16} /> エクスポート (JSON)
              </button>
              <button className="btn-soft" onClick={() => fileRef.current?.click()}>
                <Upload size={16} /> インポート
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={onFile}
              />
              <button
                className="btn ml-auto bg-red-50 text-red-600 hover:bg-red-100"
                onClick={() => {
                  if (
                    confirm(
                      "すべてのタスク・プロジェクト・ログ・集中記録を削除します。よろしいですか？（設定は残ります）"
                    )
                  ) {
                    clearAll();
                    setMessage("全データを削除しました");
                  }
                }}
              >
                <Trash2 size={16} /> 全データ削除
              </button>
            </div>
            {message && (
              <p className="mt-3 text-sm text-brand-700">{message}</p>
            )}
          </section>

          <p className="px-1 text-xs text-slate-400">
            Study Task Manager ・ 大学生・院生向けのローカル完結型タスク管理ツール
          </p>
        </div>
      )}
    </>
  );
}
