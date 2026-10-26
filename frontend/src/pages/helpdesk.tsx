import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Columns3, List, Paperclip, Plus, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/erp/StatusPill";
import { PageHeader } from "@/components/layout/PageHeader";
import { ticketQueryKey, useTickets } from "@/hooks/use-erp-data";
import type { Ticket, TicketPriority, TicketStatus } from "@/types/erp";
import { cardClass, fieldClass, ghostButtonClass, primaryButtonClass, pressableClass } from "@/utils/styles";

const columns = ["Open", "In-Progress", "Resolved"] as const satisfies readonly TicketStatus[];

export function HelpdeskPage() {
  const queryClient = useQueryClient();
  const query = useTickets();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(false);
  const tickets = query.data ?? [];

  const createTicket = (ticket: Ticket) => {
    queryClient.setQueryData<Ticket[]>(ticketQueryKey, (current = []) => [ticket, ...current]);
    toast.success(`Ticket ${ticket.id} raised`);
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Support" title="IT Helpdesk">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-muted p-1">
            {(
              [
                ["kanban", Columns3],
                ["list", List],
              ] as const
            ).map(([value, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 capitalize dark:text-slate-200"
              >
                {view === value && (
                  <motion.span
                    layoutId="helpdesk-view"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-[#0f1b33]"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}
                <Icon className="relative size-3.5" />
                <span className="relative">{value}</span>
              </button>
            ))}
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpen(true)}
            className={`${primaryButtonClass} h-9`}
          >
            <Plus className="size-4" /> New ticket
          </motion.button>
        </div>
      </PageHeader>

      {query.isError && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Tickets could not be refreshed. Showing the last available queue.
        </p>
      )}

      <AnimatePresence mode="wait">
        {view === "kanban" ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid gap-5 md:grid-cols-3"
          >
            {columns.map((column) => {
              const items = tickets.filter((ticket) => ticket.status === column);
              return (
                <div key={column} className="rounded-2xl bg-muted/70 p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <StatusPill status={column} />
                    <span className="text-xs text-slate-500">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((ticket) => (
                      <motion.div
                        layout
                        key={ticket.id}
                        whileHover={{ y: -2 }}
                        className={`${cardClass} ${pressableClass} cursor-grab rounded-xl p-4`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono">{ticket.id}</span>
                          <span>{ticket.category}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                          {ticket.title}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          {ticket.priority !== "Normal" ? (
                            <StatusPill status={ticket.priority} />
                          ) : (
                            <span className="text-[11px] text-slate-500">Normal priority</span>
                          )}
                          <span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-semibold">
                            {ticket.owner}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${cardClass} divide-y divide-slate-200 dark:divide-white/10`}
          >
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-4 px-5 py-3.5 text-sm">
                <span className="w-16 font-mono text-xs text-slate-500">{ticket.id}</span>
                <span className="flex-1 font-medium text-slate-900 dark:text-white">{ticket.title}</span>
                <span className="hidden w-24 text-xs text-slate-500 sm:block">{ticket.category}</span>
                {ticket.priority !== "Normal" && <StatusPill status={ticket.priority} />}
                <StatusPill status={ticket.status} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && <NewTicket tickets={tickets} onClose={() => setOpen(false)} onCreate={createTicket} />}
      </AnimatePresence>
    </div>
  );
}

function NewTicket({
  tickets,
  onClose,
  onCreate,
}: {
  tickets: Ticket[];
  onClose: () => void;
  onCreate: (ticket: Ticket) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [priority, setPriority] = useState<TicketPriority>("Normal");
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);

  const nextNumber =
    tickets.reduce((max, ticket) => {
      const value = Number(ticket.id.replace("TK-", ""));
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 1000) + 1;

  const submit = () => {
    if (!title.trim()) {
      toast.error("Please add a short summary");
      return;
    }
    onCreate({
      id: `TK-${nextNumber}`,
      title: title.trim(),
      category,
      status: "Open",
      priority,
      owner: "KM",
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#071b3c]/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Raise new IT support ticket"
        onClick={(event) => event.stopPropagation()}
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12203c]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="font-bold tracking-tight text-slate-900 dark:text-white">
              Raise New IT Support Ticket
            </h2>
            <p className="text-xs text-slate-500">Our team responds within 30 minutes on working days.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Summary</span>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Projector not turning on in Hall 2"
              className={fieldClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
                {["Hardware", "Software", "Network", "Access", "Email"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium">Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TicketPriority)}
                className={fieldClass}
              >
                {(["Normal", "High", "Critical"] as const).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Details</span>
            <textarea
              rows={3}
              placeholder="What happened and where?"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 dark:border-white/10 dark:bg-[#0f1b33]"
            />
          </label>
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDrag(false);
              setFiles((current) => [...current, ...Array.from(event.dataTransfer.files)]);
            }}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              drag ? "border-secondary bg-accent" : "border-slate-300 hover:bg-muted/60"
            }`}
          >
            <UploadCloud className="size-6 text-steel" />
            <span className="text-sm font-medium">Drop screenshots or click to upload</span>
            <span className="text-[11px] text-slate-500">PNG, JPG, PDF up to 10 MB</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(event) =>
                setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])
              }
            />
          </label>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <span key={`${file.name}-${index}`} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                  <Paperclip className="size-3" />
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-muted/40 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className={ghostButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={submit} className={primaryButtonClass}>
            Submit ticket
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
