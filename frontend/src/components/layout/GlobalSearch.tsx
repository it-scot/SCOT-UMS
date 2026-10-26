import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { modules, type ModulePath } from "@/components/layout/nav";
import { useShell } from "@/components/layout/shell-context";
import { assets as seedAssets, employees as seedEmployees, tickets as seedTickets } from "@/data/mock";
import { assetQueryKey, employeeQueryKey, ticketQueryKey } from "@/hooks/use-erp-data";
import type { Asset, Employee, Ticket } from "@/types/erp";
import { cn } from "@/lib/utils";

type SearchItem = {
  id: string;
  group: "Modules" | "Employees" | "Assets" | "Tickets";
  label: string;
  hint: string;
  to: ModulePath;
};

export function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useShell();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo<SearchItem[]>(() => {
    if (!searchOpen) return [];
    const employees = queryClient.getQueryData<Employee[]>(employeeQueryKey) ?? seedEmployees;
    const assetRows = queryClient.getQueryData<Asset[]>(assetQueryKey) ?? seedAssets;
    const ticketRows = queryClient.getQueryData<Ticket[]>(ticketQueryKey) ?? seedTickets;

    return [
      ...modules.map((item) => ({
        id: item.to,
        group: "Modules" as const,
        label: item.label,
        hint: item.caption,
        to: item.to,
      })),
      ...employees.map((employee) => ({
        id: employee.id,
        group: "Employees" as const,
        label: employee.name,
        hint: `${employee.id} · ${employee.department}`,
        to: "/hr" as const,
      })),
      ...assetRows.map((asset) => ({
        id: asset.id,
        group: "Assets" as const,
        label: asset.name,
        hint: asset.serial,
        to: "/admin" as const,
      })),
      ...ticketRows.map((ticket) => ({
        id: ticket.id,
        group: "Tickets" as const,
        label: ticket.title,
        hint: ticket.id,
        to: "/helpdesk" as const,
      })),
    ];
  }, [queryClient, searchOpen]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = needle
      ? items.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(needle))
      : items.filter((item) => item.group === "Modules");
    return pool.slice(0, 12);
  }, [items, query]);

  useEffect(() => {
    if (!searchOpen) return;
    setQuery("");
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => {
      document.getElementById("global-search")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [searchOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSearchOpen(false);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) =>
          results.length === 0 ? 0 : (index - 1 + results.length) % results.length,
        );
      } else if (event.key === "Enter") {
        const item = results[activeIndex];
        if (!item) return;
        event.preventDefault();
        setSearchOpen(false);
        void navigate({ to: item.to });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, navigate, results, searchOpen, setSearchOpen]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-start bg-[#071b3c]/40 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12203c]"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-white/10">
              <Search className="size-4 text-slate-500" />
              <input
                id="global-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employees, assets, tickets…"
                className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100"
              />
              <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-white/10">
                Esc
              </kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-slate-500">No matches.</li>
              )}
              {results.map((item, index) => (
                <li key={`${item.group}-${item.id}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      setSearchOpen(false);
                      void navigate({ to: item.to });
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left",
                      index === activeIndex ? "bg-accent text-accent-foreground" : "text-slate-700",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-xs text-slate-500">{item.hint}</span>
                    </span>
                    <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                      {item.group}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
