import ChangePasswordForm from "@/components/auth/change-password-form";
import Link from "next/link";

export default function CustomerSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
      <Link
        href="/customer"
        className="mb-4 inline-block text-sm text-emerald-600 hover:text-emerald-700"
      >
        ← العودة
      </Link>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">تغيير كلمة المرور</h2>
      <ChangePasswordForm />
    </main>
  );
}
