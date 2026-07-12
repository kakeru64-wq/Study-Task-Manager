"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  FlaskConical,
  CalendarDays,
  Timer,
  Settings,
  GraduationCap,
} from "lucide-react";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/tasks", label: "タスク", icon: ListTodo },
  { href: "/research", label: "研究・進捗", icon: FlaskConical },
  { href: "/calendar", label: "カレンダー", icon: CalendarDays },
  { href: "/pomodoro", label: "ポモドーロ", icon: Timer },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <GraduationCap size={20} />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-800">Study Tasks</div>
          <div className="text-[11px] text-slate-400">研究 × 締切 × 集中</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pt-4 text-[11px] text-slate-400">
        データはこの端末のブラウザ内に保存されます
      </div>
    </aside>
  );
}

// モバイル用の上部ナビ（簡易）
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-4 flex gap-1 overflow-x-auto md:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              active ? "bg-brand-600 text-white" : "bg-white text-slate-600"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
