import LoginForm from "@/components/auth/login-form";

export default function Home() {
  return (
    <div
      dir="rtl"
      className="flex min-h-full flex-1 flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4 py-12"
    >
      <main className="w-full max-w-md">
        <div className="mb-8 animate-fade-in text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/25">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white" aria-hidden="true">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">مياهي</h1>
          <p className="mt-2 text-base leading-relaxed text-emerald-700/80">
            إدارة توصيل قوارير المياه
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-emerald-700/60">
          © {new Date().getFullYear()} مياهي — جميع الحقوق محفوظة
        </p>
      </main>
    </div>
  );
}
