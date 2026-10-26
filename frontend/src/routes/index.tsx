import { createFileRoute } from "@tanstack/react-router";
import { EmployeeDashboard } from "@/pages/employee/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Employee Dashboard — SCOT Campus ERP" },
      {
        name: "description",
        content: "Shift, fingerprint attendance, and daily actions for SCOT Campus staff.",
      },
    ],
  }),
  component: EmployeeDashboard,
});
