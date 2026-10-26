import { useQuery } from "@tanstack/react-query";
import { assets, employees, tickets } from "@/data/mock";
import type { Asset, Employee, Ticket } from "@/types/erp";
import { loadOrFallback } from "@/utils/api";

const useApi = import.meta.env.VITE_USE_API === "true";

export const employeeQueryKey = ["hr", "employees"] as const;
export const assetQueryKey = ["admin", "assets"] as const;
export const ticketQueryKey = ["helpdesk", "tickets"] as const;

export function useEmployees() {
  return useQuery({
    queryKey: employeeQueryKey,
    queryFn: () => loadOrFallback<Employee[]>("/hr/employees", employees),
    ...(useApi ? {} : { initialData: employees }),
  });
}

export function useAssets() {
  return useQuery({
    queryKey: assetQueryKey,
    queryFn: () => loadOrFallback<Asset[]>("/admin/assets", assets),
    ...(useApi ? {} : { initialData: assets }),
  });
}

export function useTickets() {
  return useQuery({
    queryKey: ticketQueryKey,
    queryFn: () => loadOrFallback<Ticket[]>("/helpdesk/tickets", tickets),
    ...(useApi ? {} : { initialData: tickets }),
  });
}
