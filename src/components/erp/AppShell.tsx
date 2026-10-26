import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronsLeft, LayoutDashboard, LifeBuoy, Moon, Search, Settings, Sun, Users, GraduationCap, CalendarDays, Boxes } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/admin", label: "HR & Assets", icon: Users },
  { to: "/helpdesk", label: "Helpdesk", icon: LifeBuoy },
] as const;
const extra = [
  { label: "Academics", icon: GraduationCap },
  { label: "Leave Calendar", icon: CalendarDays },
  { label: "Inventory", icon: Boxes },
  { label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground"
      >
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold font-bold text-gold-foreground">S</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="leading-tight whitespace-nowrap">
                <div className="text-sm font-semibold text-sidebar-accent-foreground">SCOT Campus</div>
                <div className="text-[11px] opacity-60">Enterprise ERP</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {!collapsed && <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest uppercase opacity-40">Workspace</p>}
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to} className={cn("relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                {active && <motion.span layoutId="nav-bar" className="absolute top-2 -left-3 h-6 w-1 rounded-r-full bg-gold" />}
                <n.icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{n.label}</span>}
              </Link>
            );
          })}
          {!collapsed && <p className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-widest uppercase opacity-40">Modules</p>}
          {collapsed && <div className="my-4 border-t border-sidebar-border" />}
          {extra.map((n) => (
            <button key={n.label} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm opacity-70 hover:bg-sidebar-accent">
              <n.icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{n.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setCollapsed((c) => !c)} className="m-3 flex h-10 items-center gap-3 rounded-lg px-3 text-sm hover:bg-sidebar-accent" aria-label="Toggle sidebar">
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }}><ChevronsLeft className="size-[18px]" /></motion.span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-x-0 border-t-0 px-6">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="global-search" placeholder="Search employees, assets, tickets…" className="h-9 w-full rounded-lg border bg-muted/60 pr-16 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <kbd className="absolute top-1/2 right-2 -translate-y-1/2 rounded border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">Ctrl K</kbd>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setDark((d) => !d)} aria-label="Toggle theme" className="relative flex h-8 w-14 items-center rounded-full border bg-muted px-1">
              <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={cn("grid size-6 place-items-center rounded-full bg-card shadow-sm", dark && "ml-auto")}>
                {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5 text-pending" />}
              </motion.span>
            </button>
            <button className="relative grid size-9 place-items-center rounded-lg hover:bg-muted" aria-label="Notifications">
              <Bell className="size-[18px]" />
              <span className="absolute top-2 right-2 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-gold" />
              </span>
            </button>
            <div className="flex items-center gap-2.5 border-l pl-3">
              <div className="relative">
                <div className="grid size-9 place-items-center rounded-full bg-gradient-navy text-xs font-semibold text-navy-foreground">KM</div>
                <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card bg-success" />
              </div>
              <div className="hidden leading-tight md:block">
                <div className="text-sm font-medium">Krishan Malinda</div>
                <div className="text-[11px] text-muted-foreground">Systems Admin</div>
              </div>
            </div>
          </div>
        </header>
        <motion.main key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex-1 p-6 lg:p-8">
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium tracking-wider text-steel uppercase dark:text-primary">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}
