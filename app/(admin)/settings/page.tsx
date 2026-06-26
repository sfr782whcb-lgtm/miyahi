import PageHeader from "@/components/ui/page-header";
import ChangePasswordForm from "@/components/auth/change-password-form";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="الإعدادات" subtitle="إدارة حسابك" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-5 md:pb-8">
        <ChangePasswordForm />
      </main>
    </>
  );
}
