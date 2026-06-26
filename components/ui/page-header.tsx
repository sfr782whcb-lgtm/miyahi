import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <header className="bg-emerald-600 px-4 pb-5 pt-8 shadow-md md:pb-6 md:pt-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/20 transition-colors hover:bg-white/30"
              aria-label="رجوع"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden="true">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.72-7.72a.75.75 0 1 1 1.06 1.06L9.31 12l7.22 7.22a.75.75 0 1 1-1.06 1.06l-7.72-7.72Z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
          <div className="min-w-0">
            {subtitle && <p className="text-sm text-emerald-100">{subtitle}</p>}
            <h1 className="truncate text-xl font-bold text-white md:text-2xl">{title}</h1>
          </div>
        </div>
        {action}
      </div>
    </header>
  );
}
