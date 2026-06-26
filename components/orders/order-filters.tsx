"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { inputClassName, selectClassName } from "@/lib/constants";

export default function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/orders?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (search !== current) {
        update("search", search);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams, update]);

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <input
        type="search"
        placeholder="بحث بالاسم أو الهاتف..."
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
        <option value="NEW">جديد</option>
        <option value="PREPARING">قيد التحضير</option>
        <option value="OUT_FOR_DELIVERY">في الطريق</option>
        <option value="DELIVERED">تم التوصيل</option>
        <option value="CANCELLED">ملغي</option>
      </select>
      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => update("sort", e.target.value)}
        className={selectClassName}
      >
        <option value="newest">الأحدث أولاً</option>
        <option value="oldest">الأقدم أولاً</option>
        <option value="price">الأعلى سعراً</option>
      </select>
    </div>
  );
}
