import { requireDriver } from "@/app/actions/auth";
import EmptyState from "@/components/ui/empty-state";
import { getOrders } from "@/lib/queries/orders";
import DriverOrderCard from "./driver-order-card";

export const dynamic = "force-dynamic";

export default async function DriverPage() {
  const session = await requireDriver();
  const orders = await getOrders({ driverId: session.driverId });

  const active = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:max-w-lg">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        طلباتي ({active.length} نشط)
      </h2>
      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات مسندة إليك" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <DriverOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}
