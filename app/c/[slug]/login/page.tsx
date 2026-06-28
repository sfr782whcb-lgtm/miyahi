import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/auth/login-form";
import { getTenantRegisterPath } from "@/lib/auth/routes";
import { getCompanyBySlug } from "@/lib/queries/companies";
import {
  canCompanyAccessPlatform,
  resolveEffectiveCompanyStatus,
} from "@/lib/tenant/company";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TenantLoginPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) notFound();

  const effectiveStatus = resolveEffectiveCompanyStatus(company);
  if (!canCompanyAccessPlatform({ ...company, status: effectiveStatus })) {
    notFound();
  }

  return (
    <AuthShell>
      <LoginForm
        companySlug={company.slug}
        companyName={company.name}
        registerHref={getTenantRegisterPath(company.slug)}
        forgotPasswordHref={`/forgot-password?company=${company.slug}`}
      />
    </AuthShell>
  );
}
