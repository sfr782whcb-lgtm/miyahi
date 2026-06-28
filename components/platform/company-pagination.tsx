"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CompanyPagination({
  page,
  totalPages,
  total,
}: {
  page: number;
  totalPages: number;
  total: number;
}) {
  const searchParams = useSearchParams();

  function hrefFor(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    return `/platform/companies?${params.toString()}`;
  }

  if (totalPages <= 1) {
    return <p className="text-sm text-slate-500">إجمالي {total} شركة</p>;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        صفحة {page} من {totalPages} — إجمالي {total} شركة
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
            page <= 1
              ? "pointer-events-none border-slate-100 text-slate-300"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          السابق
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
            page >= totalPages
              ? "pointer-events-none border-slate-100 text-slate-300"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          التالي
        </Link>
      </div>
    </div>
  );
}
