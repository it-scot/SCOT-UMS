export const cardClass =
  "bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-[#12203c]/90";

export const pressableClass = "hover:scale-[1.02] active:scale-[0.98] transition-transform";

export const primaryButtonClass = `inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm ${pressableClass}`;

export const secondaryButtonClass = `inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-sm ${pressableClass}`;

export const ghostButtonClass = `inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-200 ${pressableClass}`;

export const fieldClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-secondary/40 dark:border-white/10 dark:bg-[#0f1b33] dark:text-slate-100";
