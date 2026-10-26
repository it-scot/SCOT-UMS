import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { Header } from "@/components/layout/Header";
import { ShellProvider, useShell } from "@/components/layout/shell-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

function ShellFrame({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { dark } = useShell();

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-sm text-slate-700 dark:text-slate-300">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <GlobalSearch />
      <Toaster theme={dark ? "dark" : "light"} />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <ShellFrame>{children}</ShellFrame>
    </ShellProvider>
  );
}
