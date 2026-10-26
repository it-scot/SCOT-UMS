import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function DetailDrawer({
  open,
  title,
  subtitle,
  badge,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  badge?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#071b3c]/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12203c]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="bg-gradient-navy p-6 text-primary-foreground">
              <button
                type="button"
                onClick={onClose}
                className="float-right grid size-8 place-items-center rounded-md hover:bg-white/10"
                aria-label="Close details"
              >
                <X className="size-4" />
              </button>
              {badge && (
                <div className="grid size-14 place-items-center rounded-2xl bg-gold text-lg font-semibold text-gold-foreground">
                  {badge}
                </div>
              )}
              <h2 className="mt-4 text-xl font-bold tracking-tight">{title}</h2>
              {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6 text-sm">{children}</div>
            {footer && <div className="flex gap-2 border-t border-slate-200 p-4 dark:border-white/10">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
