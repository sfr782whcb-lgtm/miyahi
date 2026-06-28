import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlatformDashboardPage() {
  const [companiesCount, activeCompanies, totalOrders, totalUsers] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: { in: ["ACTIVE", "TRIAL"] } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
  ]);

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      _count: { select: { users: true, orders: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "الشركات", value: companiesCount },
          { label: "شركات نشطة", value: activeCompanies },
          { label: "إجمالي الطلبات", value: totalOrders },
          { label: "المستخدمون", value: totalUsers },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">أحدث الشركات</h2>
        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{company.name}</p>
                <p className="text-sm text-gray-500" dir="ltr">
                  {company.slug}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{company._count.users} مستخدم</span>
                <span>{company._count.orders} طلب</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  {company.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-500">
          إدارة الشركات الكاملة ستتوفر في المرحلة 3.
        </p>
      </section>
    </main>
  );
}
