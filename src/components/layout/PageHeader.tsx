import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-sans text-xs font-medium tracking-wider text-steel uppercase dark:text-gold">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
