import { ListSkeleton, StatsGridSkeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <StatsGridSkeleton />
      <div className="mt-6">
        <ListSkeleton count={3} />
      </div>
    </div>
  );
}
