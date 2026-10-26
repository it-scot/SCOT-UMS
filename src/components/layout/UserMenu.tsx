import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/data/mock";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl border-l border-slate-200 py-1 pl-3 text-left hover:scale-[1.02] active:scale-[0.98] dark:border-white/10">
        <span className="relative">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-navy text-xs font-semibold text-white">
            {currentUser.initials}
          </span>
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#12203c]" />
        </span>
        <span className="hidden leading-tight md:block">
          <span className="block text-sm font-medium text-slate-900 dark:text-white">
            {currentUser.name}
          </span>
          <span className="block text-[11px] text-slate-500">{currentUser.role}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          {currentUser.name}
          <span className="mt-0.5 block text-xs font-normal text-slate-500">{currentUser.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => toast("Profile preferences will sync from the Spring Boot account service")}
        >
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.success("Signed out of the local session")}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
