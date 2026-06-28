import Link from "next/link";
import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import OrderCard from "@/components/orders/order-card";
import OrderFilters from "@/components/orders/order-filters";
import { ListSkeleton } from "@/components/ui/skeleton";
import { getOrders } from "@/lib/queries/orders";
import { requireAdmin } from "@/app/actions/auth";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ search?: string; status?: string; sort?: string }>;
};

async function OrdersList({ searchParams }: Props) {
  const session = await requireAdmin();
  const params = await searchParams;
  const orders = await getOrders(session.companyId, {
    search: params.search,
    status: params.status as OrderStatus | undefined,
    sort: (params.sort as "newest" | "oldest" | "price") ?? "newest",
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        title="لا توجد طلبات"
        description="جرّب تغيير معايير البحث أو أنشئ طلباً جديداً"
        action={<Link href="/orders/new" className="text-sm font-medium text-emerald-600">+ طلب جديد</Link>}
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

export default async function OrdersPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const orders = await getOrders(session.companyId);

  return (
    <>
      <PageHeader
        title="الطلبات"
        subtitle={`${orders.length} طلب`}
        action={
          <Link href="/orders/new" className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30">
            + طلب جديد
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:pb-8">
        <Suspense fallback={<ListSkeleton count={4} />}>
          <OrderFilters />
        </Suspense>
        <Suspense fallback={<ListSkeleton count={4} />}>
          <OrdersList searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
