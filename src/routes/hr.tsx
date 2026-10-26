import { createFileRoute } from "@tanstack/react-router";
import { HrDashboard } from "@/pages/hr-dashboard";

export const Route = createFileRoute("/hr")({
  head: () => ({
    meta: [
      { title: "HR Dashboard — SCOT Campus ERP" },
      { name: "description", content: "People directory, leave status, and employee records." },
    ],
  }),
  component: HrDashboard,
});
