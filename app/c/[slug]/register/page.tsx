import { notFound } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";
import RegisterForm from "@/components/auth/register-form";
import { getTenantLoginPath } from "@/lib/auth/routes";
import { getCompanyBySlug } from "@/lib/queries/companies";
import {
  canCompanyAccessPlatform,
  resolveEffectiveCompanyStatus,
} from "@/lib/tenant/company";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TenantRegisterPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) notFound();

  const effectiveStatus = resolveEffectiveCompanyStatus(company);
  if (!canCompanyAccessPlatform({ ...company, status: effectiveStatus })) {
    notFound();
  }

  return (
    <AuthShell>
      <RegisterForm
        companySlug={company.slug}
        companyName={company.name}
        loginHref={getTenantLoginPath(company.slug)}
      />
    </AuthShell>
  );
}
