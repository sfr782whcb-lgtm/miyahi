import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import { requireAdmin } from "@/app/actions/auth";
import { getProducts } from "@/lib/queries/products";
import { AddProductForm, ProductToggle } from "./product-forms";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await requireAdmin();
  const products = await getProducts(session.companyId);

  return (
    <>
      <PageHeader title="المنتجات" subtitle={`${products.length} منتج`} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:pb-8">
        <AddProductForm />
        {products.length === 0 ? (
          <EmptyState title="لا توجد منتجات" />
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{p.sizeLiters} لتر — {p.price} دينار</p>
                </div>
                <ProductToggle product={p} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
