import { createFileRoute } from "@tanstack/react-router";
import { HelpdeskPage } from "@/pages/helpdesk";

export const Route = createFileRoute("/helpdesk")({
  head: () => ({
    meta: [
      { title: "IT Helpdesk — SCOT Campus ERP" },
      { name: "description", content: "Track and raise IT support tickets for SCOT Campus." },
    ],
  }),
  component: HelpdeskPage,
});
