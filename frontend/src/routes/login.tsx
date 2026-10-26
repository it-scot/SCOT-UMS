import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SCOT Campus ERP" },
      {
        name: "description",
        content: "Development login for SCOT Campus ERP role workspaces.",
      },
    ],
  }),
  component: LoginPage,
});
