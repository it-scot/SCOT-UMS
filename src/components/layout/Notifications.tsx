import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { notifications as seed } from "@/data/mock";
import type { AppNotification } from "@/types/erp";

export function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(AppNotification & { unread: boolean })[]>(
    seed.map((item) => ({ ...item, unread: true })),
  );
  const unread = items.filter((item) => item.unread).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative grid size-9 place-items-center rounded-lg hover:scale-[1.02] hover:bg-white/70 active:scale-[0.98] dark:hover:bg-white/10"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-gold" />
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 cursor-default"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-12 right-0 z-40 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#12203c]/95"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                <button
                  type="button"
                  className="text-xs font-medium text-steel"
                  onClick={() => {
                    setItems((current) => current.map((item) => ({ ...item, unread: false })));
                    toast.success("Notifications marked as read");
                  }}
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-80 divide-y divide-slate-200 overflow-y-auto dark:divide-white/10">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-accent"
                      onClick={() => {
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, unread: false } : entry,
                          ),
                        );
                        toast.success(item.title);
                      }}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        {item.unread && <span className="size-2 shrink-0 rounded-full bg-gold" />}
                      </span>
                      <span className="text-xs text-slate-500">{item.body}</span>
                      <span className="text-[11px] text-slate-500">{item.time}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
