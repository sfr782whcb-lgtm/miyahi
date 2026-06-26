import PageHeader from "@/components/ui/page-header";
import { getActiveDriversCount, getDrivers } from "@/lib/queries/drivers";
import { AddDriverForm, DriverStatusSelect } from "./driver-forms";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const [drivers, activeCount] = await Promise.all([
    getDrivers(),
    getActiveDriversCount(),
  ]);

  return (
    <>
      <PageHeader title="السائقين" subtitle={`${activeCount} سائقين نشطين`} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:pb-8">
        <div className="space-y-3">
          {drivers.map((driver) => (
            <div key={driver.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {driver.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{driver.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{driver.todayOrders} طلبات اليوم</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${driver.statusColor}`}>
                  {driver.statusLabel}
                </span>
                <DriverStatusSelect driver={driver} />
              </div>
            </div>
          ))}
        </div>
        <AddDriverForm />
      </main>
    </>
  );
}
