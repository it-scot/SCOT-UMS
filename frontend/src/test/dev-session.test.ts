import { describe, expect, it } from "vitest";
import { canAccessPath, DEV_LOGINS, issueDevJwt } from "@/auth/dev-session";

describe("Quick Dev Login presets", () => {
  it("covers the four campus roles", () => {
    expect(DEV_LOGINS.map((item) => item.email)).toEqual([
      "it@scot.lk",
      "admin@scot.lk",
      "hr@scot.lk",
      "emp@scot.lk",
    ]);
  });

  it("sends each role to its dashboard", () => {
    expect(canAccessPath("IT_ADMIN", "/helpdesk")).toBe(true);
    expect(canAccessPath("SYSTEM_ADMIN", "/admin")).toBe(true);
    expect(canAccessPath("HR", "/hr")).toBe(true);
    expect(canAccessPath("EMPLOYEE", "/")).toBe(true);
    expect(canAccessPath("EMPLOYEE", "/admin")).toBe(false);
  });

  it("issues a mock JWT for localStorage", () => {
    const token = issueDevJwt(DEV_LOGINS[0]!);
    expect(token.split(".")).toHaveLength(3);
  });
});
