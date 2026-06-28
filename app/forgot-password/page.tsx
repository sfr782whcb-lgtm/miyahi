import AuthShell from "@/components/auth/auth-shell";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

type Props = {
  searchParams: Promise<{ company?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { company } = await searchParams;

  return (
    <AuthShell>
      <ForgotPasswordForm defaultCompanySlug={company ?? ""} />
    </AuthShell>
  );
}
