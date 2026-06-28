"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { inputClassName, selectClassName } from "@/lib/constants";

export default function CompanyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/platform/companies?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (search !== current) update("search", search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams, update]);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <input
        type="search"
        placeholder="بحث بالاسم أو الرمز أو الهاتف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={inputClassName}
      />
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className={selectClassName}
      >
        <option value="">كل الحالات</option>
        <option value="TRIAL">تجريبي</option>
        <option value="ACTIVE">نشط</option>
        <option value="SUSPENDED">موقوف</option>
        <option value="EXPIRED">منتهي</option>
      </select>
      <select
        value={searchParams.get("plan") ?? ""}
        onChange={(e) => update("plan", e.target.value)}
        className={selectClassName}
      >
        <option value="">كل الخطط</option>
        <option value="MONTHLY">شهري</option>
        <option value="YEARLY">سنوي</option>
        <option value="NONE">بدون خطة</option>
      </select>
      <select
        value={searchParams.get("pageSize") ?? "10"}
        onChange={(e) => update("pageSize", e.target.value)}
        className={selectClassName}
      >
        <option value="10">10 لكل صفحة</option>
        <option value="20">20 لكل صفحة</option>
        <option value="50">50 لكل صفحة</option>
      </select>
    </div>
  );
}
