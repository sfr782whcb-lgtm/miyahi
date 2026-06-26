"use client";

import Link from "next/link";
import { buttonPrimaryClassName } from "@/lib/constants";

export default function NotFound() {
  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-emerald-600">404</h1>
      <p className="mt-4 text-xl font-semibold text-gray-900">الصفحة غير موجودة</p>
      <p className="mt-2 text-gray-500">تعذّر العثور على الصفحة المطلوبة</p>
      <Link href="/" className={`mt-6 inline-block ${buttonPrimaryClassName}`}>
        العودة للرئيسية
      </Link>
    </div>
  );
}
