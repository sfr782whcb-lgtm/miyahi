import { requireCustomer } from "@/app/actions/auth";
import EmptyState from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { getOrders } from "@/lib/queries/orders";
import { getProducts } from "@/lib/queries/products";
import CustomerOrderForm from "./customer-order-form";

export const dynamic = "force-dynamic";

export default async function CustomerPage() {
  const session = await requireCustomer();
  const [orders, products, customer] = await Promise.all([
    getOrders({ customerId: session.customerId }),
    getProducts(true),
    session.customerId
      ? prisma.customer.findUnique({ where: { id: session.customerId } })
      : null,
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:max-w-lg">
      <CustomerOrderForm
        products={products}
        defaultName={customer?.name ?? session.name}
        defaultPhone={customer?.phone ?? ""}
        defaultAddress={customer?.address ?? ""}
        defaultArea={customer?.area ?? ""}
      />

      <h2 className="mb-4 text-lg font-semibold text-gray-900">طلباتي</h2>
      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات سابقة" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{order.displayId}</p>
                  <p className="mt-1 text-sm text-gray-500">{order.bottles} قوارير — {order.price} دينار</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.statusColor}`}>
                  {order.statusLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
