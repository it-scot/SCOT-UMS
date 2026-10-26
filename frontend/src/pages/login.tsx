import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DEV_LOGINS, startDevSession, type DevLoginPreset } from "@/auth/dev-session";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { cardClass, pressableClass } from "@/utils/styles";

export function LoginPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && session) {
      void navigate({ to: session.user.home, replace: true });
    }
  }, [hydrated, navigate, session]);

  const signIn = (preset: DevLoginPreset) => {
    const next = startDevSession(preset);
    toast.success(`Signed in as ${preset.label}`, { description: preset.email });
    void navigate({ to: next.user.home });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(cardClass, "w-full max-w-lg p-8 hover:shadow-md")}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-gold font-bold text-gold-foreground">
            S
          </div>
          <div>
            <p className="font-sans text-xs font-medium tracking-widest text-slate-500 uppercase">
              SCOT Campus
            </p>
            <h1 className="font-sans text-xl font-bold tracking-tight text-slate-900">
              Enterprise ERP
            </h1>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 shrink-0" />
            Quick Dev Login
          </p>
          <p className="mt-1 font-sans text-xs text-amber-700/80">
            Development only. Google Workspace @scot.lk OAuth will replace this before production.
          </p>
        </div>

        <AnimatePresence>
          <div className="space-y-3">
            {DEV_LOGINS.map((preset, index) => (
              <motion.button
                key={preset.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                onClick={() => signIn(preset)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 text-left shadow-sm",
                  pressableClass,
                  "hover:border-steel/30 hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-full border text-lg",
                    preset.accentClass,
                  )}
                >
                  {preset.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-sans text-sm font-bold tracking-tight text-slate-900">
                    {preset.label}
                  </span>
                  <span className="mt-0.5 block font-sans text-xs text-slate-500">
                    {preset.email} · {preset.caption}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
