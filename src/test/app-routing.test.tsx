import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  it("registers the four campus modules", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const paths = ["/", "/hr", "/admin", "/helpdesk"] as const;

    for (const path of paths) {
      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });
});
