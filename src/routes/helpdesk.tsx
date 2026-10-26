import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Columns3, List, Plus, UploadCloud, X, Paperclip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/erp/AppShell";
import { StatusPill } from "@/components/erp/StatusPill";

export const Route = createFileRoute("/helpdesk")({
  head: () => ({
    meta: [
      { title: "IT Helpdesk — SCOT Campus ERP" },
      { name: "description", content: "Track and raise IT support tickets for SCOT Campus." },
      { property: "og:title", content: "IT Helpdesk — SCOT Campus ERP" },
      { property: "og:description", content: "Track and raise IT support tickets for SCOT Campus." },
    ],
  }),
  component: Helpdesk,
});

type T = { id: string; title: string; cat: string; status: string; priority: string; who: string };
const seed: T[] = [
  { id: "TK-1051", title: "Wi-Fi drops in Lecture Hall 3", cat: "Network", status: "Open", priority: "High", who: "RJ" },
  { id: "TK-1049", title: "Outlook not syncing on laptop", cat: "Software", status: "Open", priority: "Normal", who: "NP" },
  { id: "TK-1042", title: "RAM upgrade request", cat: "Hardware", status: "In-Progress", priority: "Normal", who: "DW" },
  { id: "TK-1038", title: "Fingerprint device offline — Gate 2", cat: "Access", status: "In-Progress", priority: "Critical", who: "KR" },
  { id: "TK-1030", title: "Printer toner replacement", cat: "Hardware", status: "Resolved", priority: "Normal", who: "IS" },
  { id: "TK-1027", title: "VPN access for remote staff", cat: "Network", status: "Resolved", priority: "Normal", who: "HG" },
];
const cols = ["Open", "In-Progress", "Resolved"];

function Helpdesk() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [tickets, setTickets] = useState(seed);
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Support" title="IT Helpdesk">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-muted p-1">
            {([["kanban", Columns3], ["list", List]] as const).map(([v, I]) => (
              <button key={v} onClick={() => setView(v)} className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize">
                {view === v && <motion.span layoutId="view" className="absolute inset-0 rounded-md bg-card shadow-sm" />}
                <I className="relative size-3.5" /><span className="relative">{v}</span>
              </button>
            ))}
          </div>
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setOpen(true)} className="flex h-9 items-center gap-2 rounded-lg bg-steel px-4 text-sm font-medium text-primary-foreground shadow-md">
            <Plus className="size-4" /> New ticket
          </motion.button>
        </div>
      </PageHeader>

      <AnimatePresence mode="wait">
        {view === "kanban" ? (
          <motion.div key="k" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-5 md:grid-cols-3">
            {cols.map((c) => {
              const items = tickets.filter((t) => t.status === c);
              return (
                <div key={c} className="rounded-2xl bg-muted/70 p-3">
                  <div className="mb-3 flex items-center justify-between px-1"><StatusPill status={c} /><span className="text-xs text-muted-foreground">{items.length}</span></div>
                  <div className="space-y-3">
                    {items.map((t) => (
                      <motion.div layout key={t.id} whileHover={{ y: -2 }} className="glass glass-hover cursor-grab rounded-xl p-4">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span className="font-mono">{t.id}</span><span>{t.cat}</span></div>
                        <p className="mt-2 text-sm font-medium">{t.title}</p>
                        <div className="mt-3 flex items-center justify-between">
                          {t.priority !== "Normal" ? <StatusPill status={t.priority} /> : <span className="text-[11px] text-muted-foreground">Normal priority</span>}
                          <span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-semibold">{t.who}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="l" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="glass divide-y rounded-2xl">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-muted/50">
                <span className="w-16 font-mono text-xs text-muted-foreground">{t.id}</span>
                <span className="flex-1 font-medium">{t.title}</span>
                <span className="hidden w-24 text-xs text-muted-foreground sm:block">{t.cat}</span>
                {t.priority !== "Normal" && <StatusPill status={t.priority} />}
                <StatusPill status={t.status} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{open && <NewTicket onClose={() => setOpen(false)} onCreate={(t) => setTickets((x) => [t, ...x])} next={1052 + tickets.length - seed.length} />}</AnimatePresence>
    </div>
  );
}

function NewTicket({ onClose, onCreate, next }: { onClose: () => void; onCreate: (t: T) => void; next: number }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Hardware");
  const [priority, setPriority] = useState("Normal");
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const field = "h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  const submit = () => {
    if (!title.trim()) { toast.error("Please add a short summary"); return; }
    onCreate({ id: `TK-${next}`, title, cat, status: "Open", priority, who: "KM" });
    toast.success(`Ticket TK-${next} raised`);
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div><h2 className="font-semibold">Raise New IT Support Ticket</h2><p className="text-xs text-muted-foreground">Our team responds within 30 minutes on working days.</p></div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-muted"><X className="size-4" /></button>
        </div>
        <div className="space-y-4 p-6">
          <label className="block space-y-1.5"><span className="text-xs font-medium">Summary</span><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Projector not turning on in Hall 2" className={field} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5"><span className="text-xs font-medium">Category</span>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={field}>{["Hardware", "Software", "Network", "Access", "Email"].map((o) => <option key={o}>{o}</option>)}</select>
            </label>
            <label className="space-y-1.5"><span className="text-xs font-medium">Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={field}>{["Normal", "High", "Critical"].map((o) => <option key={o}>{o}</option>)}</select>
            </label>
          </div>
          <label className="block space-y-1.5"><span className="text-xs font-medium">Details</span><textarea rows={3} placeholder="What happened and where?" className="w-full rounded-lg border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
          <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); setFiles([...files, ...Array.from(e.dataTransfer.files)]); }}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${drag ? "border-steel bg-accent" : "hover:bg-muted/60"}`}>
            <UploadCloud className="size-6 text-steel dark:text-primary" />
            <span className="text-sm font-medium">Drop screenshots or click to upload</span>
            <span className="text-[11px] text-muted-foreground">PNG, JPG, PDF up to 10 MB</span>
            <input type="file" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
          </label>
          {files.length > 0 && <div className="flex flex-wrap gap-2">{files.map((f, i) => <span key={i} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"><Paperclip className="size-3" />{f.name}</span>)}</div>}
        </div>
        <div className="flex justify-end gap-2 border-t bg-muted/40 px-6 py-4">
          <button onClick={onClose} className="h-9 rounded-lg border bg-card px-4 text-sm hover:bg-muted">Cancel</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={submit} className="h-9 rounded-lg bg-steel px-4 text-sm font-medium text-primary-foreground">Submit ticket</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
