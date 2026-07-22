import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
}

export default function PageHeader({ title, subtitle, backHref }: PageHeaderProps) {
  return (
    <header className="mb-5 flex items-start gap-3">
      {backHref && (
        <Link
          href={backHref}
          aria-label="חזרה"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-200 active:bg-slate-100"
        >
          {/* RTL: back arrow points right */}
          →
        </Link>
      )}
      <div>
        <h1 className="text-xl font-bold text-brand-800">{title}</h1>
        {subtitle && <p className="text-slate-600">{subtitle}</p>}
      </div>
    </header>
  );
}
