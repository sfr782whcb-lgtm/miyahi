import AuthShell from "@/components/auth/auth-shell";
import CompanyRegisterForm from "@/components/auth/company-register-form";

export default function CompanyRegisterPage() {
  return (
    <AuthShell>
      <CompanyRegisterForm />
    </AuthShell>
  );
}
