import PageHeader from "@/components/ui/page-header";
import { getAvailableDrivers } from "@/lib/queries/drivers";
import { getProducts } from "@/lib/queries/products";
import NewOrderForm from "./new-order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const [drivers, products] = await Promise.all([
    getAvailableDrivers(),
    getProducts(true),
  ]);

  return (
    <>
      <PageHeader title="طلب جديد" backHref="/orders" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:max-w-lg">
        <NewOrderForm drivers={drivers} products={products} />
      </main>
    </>
  );
}
