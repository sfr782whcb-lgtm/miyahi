import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import { getCustomers } from "@/lib/queries/customers";
import AddCustomerForm from "./add-customer-form";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <PageHeader title="الزبائن" subtitle={`${customers.length} زبون`} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:pb-8">
        <AddCustomerForm />
        {customers.length === 0 ? (
          <EmptyState title="لا يوجد زبائن بعد" />
        ) : (
          <div className="space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="mt-1 text-sm text-gray-500" dir="ltr">{c.phone}</p>
                {(c.area || c.address) && (
                  <p className="mt-1 text-sm text-gray-500">{[c.area, c.address].filter(Boolean).join(" — ")}</p>
                )}
                <p className="mt-1 text-sm text-emerald-600">{c.ordersCount} طلب</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
