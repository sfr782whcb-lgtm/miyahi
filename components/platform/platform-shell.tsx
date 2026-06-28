"use client";

import { useState } from "react";
import LogoutButton from "@/components/ui/logout-button";
import PlatformNav from "@/components/platform/platform-nav";

export default function PlatformShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div dir="rtl" className="flex min-h-full flex-1 bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-l border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">مياهي SaaS</p>
          <h1 className="mt-1 text-lg font-bold text-slate-900">لوحة المالك</h1>
          <p className="mt-1 text-sm text-slate-500">{adminName}</p>
        </div>
        <div className="flex-1 px-3 py-4">
          <PlatformNav />
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <LogoutButton variant="dark" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-indigo-600">منصة مياهي</p>
              <p className="text-sm font-semibold text-slate-900">{adminName}</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              القائمة
            </button>
          </div>
          {mobileOpen ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <PlatformNav onNavigate={() => setMobileOpen(false)} />
              <div className="mt-2 px-2">
                <LogoutButton variant="dark" />
              </div>
            </div>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
