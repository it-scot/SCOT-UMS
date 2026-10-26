import { useEffect, useState } from "react";
import {
  DEV_SESSION_EVENT,
  readDevSession,
  type DevSession,
} from "@/auth/dev-session";

export function useSession(): DevSession | null {
  const [session, setSession] = useState<DevSession | null>(readDevSession);

  useEffect(() => {
    const sync = () => setSession(readDevSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(DEV_SESSION_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(DEV_SESSION_EVENT, sync);
    };
  }, []);

  return session;
}
