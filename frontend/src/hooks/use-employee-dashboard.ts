import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardSummaryFallback } from "@/data/employee-dashboard";
import type {
  DashboardSummary,
  DinnerAllowanceClaimResponse,
  OutOfOfficeResponse,
} from "@/types/employee-dashboard";
import { ApiError, api, loadOrFallback } from "@/utils/api";

const useApi = import.meta.env.VITE_USE_API === "true";

export const dashboardQueryKey = ["employee", "dashboard-summary"] as const;

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => loadOrFallback<DashboardSummary>("/v1/employee/dashboard-summary", dashboardSummaryFallback),
    ...(useApi ? { refetchInterval: 30_000 } : { initialData: dashboardSummaryFallback }),
  });
}

export function useToggleOutOfOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<OutOfOfficeResponse> => {
      if (useApi) {
        return api<OutOfOfficeResponse>("/v1/employee/attendance/out-of-office", { method: "POST" });
      }
      const current = queryClient.getQueryData<DashboardSummary>(dashboardQueryKey) ?? dashboardSummaryFallback;
      const active = !current.outOfOffice.active;
      return {
        active,
        allowanceMinutes: current.outOfOffice.allowanceMinutes,
        usedMinutes: current.outOfOffice.usedMinutes,
        remainingMinutes: active
          ? Math.max(0, current.outOfOffice.allowanceMinutes - current.outOfOffice.usedMinutes)
          : current.outOfOffice.remainingMinutes,
        message: active
          ? "Out-of-office break started. 20-minute lunch counter is running."
          : "Break ended. Welcome back on campus.",
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<DashboardSummary>(dashboardQueryKey, (current) => {
        const base = current ?? dashboardSummaryFallback;
        return {
          ...base,
          outOfOffice: {
            ...base.outOfOffice,
            active: result.active,
            usedMinutes: result.usedMinutes,
            remainingMinutes: result.remainingMinutes,
          },
        };
      });
      if (useApi) {
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      }
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not update break status");
    },
  });
}

export function useClaimDinnerAllowance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<DinnerAllowanceClaimResponse> => {
      if (useApi) {
        return api<DinnerAllowanceClaimResponse>("/v1/employee/attendance/claim-dinner-allowance", {
          method: "POST",
        });
      }
      return {
        claimed: true,
        amountLkr: 700,
        transportRequested: true,
        message: "Rs. 700 dinner allowance claimed. Campus transport request submitted.",
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<DashboardSummary>(dashboardQueryKey, (current) => {
        const base = current ?? dashboardSummaryFallback;
        return {
          ...base,
          dinnerAllowance: {
            ...base.dinnerAllowance,
            claimed: true,
            eligible: false,
            transportEligible: false,
          },
          attendance: { ...base.attendance, overtimeEligible: true },
        };
      });
      if (useApi) {
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      }
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Dinner allowance could not be claimed");
    },
  });
}
