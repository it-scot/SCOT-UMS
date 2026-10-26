import type { LucideIcon } from "lucide-react";
import { Boxes, LayoutDashboard, LifeBuoy, Users } from "lucide-react";

export type ModulePath = "/" | "/hr" | "/admin" | "/helpdesk";

export type ModuleLink = {
  to: ModulePath;
  label: string;
  caption: string;
  icon: LucideIcon;
};

export const modules: ModuleLink[] = [
  { to: "/", label: "Employee Dashboard", caption: "Shift and attendance", icon: LayoutDashboard },
  { to: "/hr", label: "HR Dashboard", caption: "People and leave", icon: Users },
  { to: "/admin", label: "Admin & Logistics", caption: "Assets and facilities", icon: Boxes },
  { to: "/helpdesk", label: "IT Helpdesk", caption: "Support tickets", icon: LifeBuoy },
];
