export default function PlatformStatCard({
  label,
  value,
  hint,
  accent = "indigo",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}) {
  const accents = {
    indigo: "border-indigo-100 bg-indigo-50/60 text-indigo-700",
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    amber: "border-amber-100 bg-amber-50/60 text-amber-700",
    rose: "border-rose-100 bg-rose-50/60 text-rose-700",
    sky: "border-sky-100 bg-sky-50/60 text-sky-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accents[accent]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
