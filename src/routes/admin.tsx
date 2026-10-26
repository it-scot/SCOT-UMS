import { createFileRoute } from "@tanstack/react-router";
import { AdminLogistics } from "@/pages/admin-logistics";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin & Logistics — SCOT Campus ERP" },
      { name: "description", content: "Campus asset register, assignments, and repair status." },
    ],
  }),
  component: AdminLogistics,
});
