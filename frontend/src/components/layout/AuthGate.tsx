import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { canAccessPath } from "@/auth/dev-session";
import { useSession } from "@/hooks/use-session";

function SessionSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="bg-white/90 flex items-center gap-3 rounded-2xl border border-slate-200/80 px-5 py-4 text-sm text-slate-600 shadow-sm backdrop-blur-md">
        <span className="grid size-8 place-items-center rounded-lg bg-gold font-bold text-gold-foreground">
          S
        </span>
        Checking campus session…
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      window.location.replace("/login");
      return;
    }
    if (!canAccessPath(session.user.roleKey, pathname)) {
      void navigate({ to: session.user.home, replace: true });
    }
  }, [hydrated, navigate, pathname, session]);

  if (!hydrated || !session || !canAccessPath(session.user.roleKey, pathname)) {
    return <SessionSplash />;
  }

  return children;
}
