import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm companySlug="default" showCompanySlugField forgotPasswordHref="/forgot-password" />
      <div className="mt-6 space-y-2 text-center text-sm text-gray-600">
        <p>
          تمثل شركة مياه؟{" "}
          <Link href="/register/company" className="font-semibold text-emerald-600 hover:text-emerald-700">
            سجّل شركتك
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
