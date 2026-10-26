import { motion } from "framer-motion";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { toast } from "sonner";
import { Notifications } from "@/components/layout/Notifications";
import { useShell } from "@/components/layout/shell-context";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";
import { pressableClass } from "@/utils/styles";

export function Header() {
  const { dark, toggleTheme, setSearchOpen, setMobileOpen } = useShell();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-[#f0f3ff]/80 px-4 backdrop-blur-md md:px-6 dark:border-white/10 dark:bg-[#0b1730]/80">
      <button
        type="button"
        className={cn(
          "grid size-9 place-items-center rounded-lg hover:bg-white md:hidden",
          pressableClass,
        )}
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-[18px]" />
      </button>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative flex h-10 max-w-md flex-1 items-center rounded-xl border border-slate-200 bg-white/80 pr-16 pl-9 text-left text-sm text-slate-500 hover:shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        Search employees, assets, tickets…
        <kbd className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-white/10 dark:bg-transparent">
          Ctrl K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            toggleTheme();
            toast.success(dark ? "Light mode on" : "Dark mode on");
          }}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="relative flex h-8 w-14 items-center rounded-full border border-slate-200 bg-white px-1 dark:border-white/10 dark:bg-white/10"
        >
          <motion.span
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "grid size-6 place-items-center rounded-full bg-[#f0f3ff] text-navy shadow-sm",
              dark && "ml-auto",
            )}
          >
            {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5 text-gold" />}
          </motion.span>
        </button>
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}
