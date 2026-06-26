"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">حدث خطأ</h1>
      <p className="mt-2 text-gray-500">عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
