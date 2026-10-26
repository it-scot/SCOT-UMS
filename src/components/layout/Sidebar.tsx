import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { modules } from "@/components/layout/nav";
import { useShell } from "@/components/layout/shell-context";

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useShell();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const path = useRouterState({ select: (state) => state.location.pathname });
  const compact = collapsed && !isMobile;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[#071b3c]/40 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ width: isMobile ? 260 : collapsed ? 76 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground md:sticky",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform duration-300 ease-in-out md:transition-none",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold font-bold text-gold-foreground">
            S
          </div>
          <AnimatePresence>
            {!compact && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="leading-tight whitespace-nowrap"
              >
                <div className="text-sm font-bold tracking-tight text-white">SCOT Campus</div>
                <div className="text-[11px] text-slate-400">Enterprise ERP</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {!compact && (
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              Workspace
            </p>
          )}
          {modules.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:scale-[1.02] active:scale-[0.98]",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-slate-300 hover:bg-sidebar-accent hover:text-white",
                  compact && "justify-center px-0",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-bar"
                    className="absolute top-2 -left-3 h-6 w-1 rounded-r-full bg-gold"
                  />
                )}
                <Icon className="size-[18px] shrink-0" />
                {!compact && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "m-3 hidden h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-sidebar-accent hover:text-white md:flex",
            compact && "justify-center px-0",
          )}
          aria-label="Toggle sidebar"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronsLeft className="size-[18px]" />
          </motion.span>
          {!compact && <span>Collapse</span>}
        </button>
      </motion.aside>
    </>
  );
}
