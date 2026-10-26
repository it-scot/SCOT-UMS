import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Search, X, Mail, Phone, Laptop, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/erp/AppShell";
import { StatusPill } from "@/components/erp/StatusPill";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "HR & Assets — SCOT Campus ERP" },
      { name: "description", content: "Search and manage SCOT Campus employees and assigned assets." },
      { property: "og:title", content: "HR & Assets — SCOT Campus ERP" },
      { property: "og:description", content: "Search and manage SCOT Campus employees and assigned assets." },
    ],
  }),
  component: Admin,
});

type Row = { id: string; name: string; role: string; dept: string; asset: string; serial: string; status: string; email: string };
const rows: Row[] = [
  { id: "EMP-0142", name: "Nadeesha Perera", role: "HR Executive", dept: "Human Resources", asset: "Dell Latitude 5440", serial: "SN-DL-88213", status: "Active", email: "nadeesha@scot.lk" },
  { id: "EMP-0157", name: "Ruwan Jayasinghe", role: "Network Engineer", dept: "IT Services", asset: "MacBook Pro 14", serial: "SN-AP-10942", status: "Assigned", email: "ruwan@scot.lk" },
  { id: "EMP-0163", name: "Tharushi Fernando", role: "Accountant", dept: "Finance", asset: "HP EliteBook 840", serial: "SN-HP-55120", status: "On Leave", email: "tharushi@scot.lk" },
  { id: "EMP-0171", name: "Dilan Wickramasinghe", role: "Lab Technician", dept: "Engineering", asset: "Epson EB-X51", serial: "SN-EP-31007", status: "Repair", email: "dilan@scot.lk" },
  { id: "EMP-0188", name: "Ishara Silva", role: "Registrar", dept: "Administration", asset: "Lenovo ThinkPad T14", serial: "SN-LN-70455", status: "Active", email: "ishara@scot.lk" },
  { id: "EMP-0194", name: "Kasun Rathnayake", role: "Security Lead", dept: "Facilities", asset: "ZKTeco K40", serial: "SN-ZK-00419", status: "Critical", email: "kasun@scot.lk" },
  { id: "EMP-0203", name: "Hiruni Gunawardena", role: "Librarian", dept: "Library", asset: "iPad Air", serial: "SN-AP-22871", status: "Active", email: "hiruni@scot.lk" },
];
const filters = ["All", "Active", "Assigned", "On Leave", "Repair", "Critical"];
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("");

function Admin() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [sel, setSel] = useState<Row | null>(null);
  const list = useMemo(() => rows.filter((r) => (f === "All" || r.status === f) && `${r.name} ${r.id} ${r.serial} ${r.dept}`.toLowerCase().includes(q.toLowerCase())), [q, f]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Management" title="Employees & Assets" />
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, ID, serial…" className="h-9 w-full rounded-lg border bg-card pl-9 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {filters.map((x) => (
              <button key={x} onClick={() => setF(x)} className="relative rounded-md px-3 py-1 text-xs font-medium">
                {f === x && <motion.span layoutId="filter" className="absolute inset-0 rounded-md bg-card shadow-sm" />}
                <span className="relative">{x}</span>
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{list.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr className="border-b">{["Employee", "Department", "Asset", "Serial", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {list.map((r) => (
                  <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(r)} className="cursor-pointer border-b last:border-0 hover:bg-muted/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-full bg-accent text-[11px] font-semibold text-steel dark:text-primary">{initials(r.name)}</div>
                        <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.dept}</td>
                    <td className="px-4 py-3">{r.asset}</td>
                    <td className="px-4 py-3"><code className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px]">{r.serial}</code></td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="grid size-8 place-items-center rounded-md hover:bg-accent"><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSel(r)}>View details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Asset reassignment opened")}>Reassign asset</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.error("Marked for repair")}>Mark for repair</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {list.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No records match your filters.</p>}
        </div>
      </div>

      <AnimatePresence>
        {sel && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)} />
            <motion.aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-card shadow-2xl"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 34 }}>
              <div className="bg-gradient-navy p-6 text-navy-foreground">
                <button onClick={() => setSel(null)} className="float-right grid size-8 place-items-center rounded-md hover:bg-navy-foreground/10"><X className="size-4" /></button>
                <div className="grid size-14 place-items-center rounded-2xl bg-gold text-lg font-semibold text-gold-foreground">{initials(sel.name)}</div>
                <h2 className="mt-4 text-xl font-semibold">{sel.name}</h2>
                <p className="text-sm opacity-70">{sel.role} · {sel.id}</p>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-6 text-sm">
                <StatusPill status={sel.status} />
                {[[Building2, "Department", sel.dept], [Mail, "Email", sel.email], [Phone, "Extension", "+94 11 2 45" + sel.id.slice(-2)], [Laptop, "Assigned asset", sel.asset]].map(([I, k, v]) => {
                  const Icon = I as typeof Mail;
                  return (
                    <div key={k as string} className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></span>
                      <div><div className="text-xs text-muted-foreground">{k as string}</div><div className="font-medium">{v as string}</div></div>
                    </div>
                  );
                })}
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">Serial number</div>
                  <code className="font-mono">{sel.serial}</code>
                  <div className="mt-3 text-xs text-muted-foreground">Warranty until Mar 2027 · Last audited Sep 2026</div>
                </div>
              </div>
              <div className="flex gap-2 border-t p-4">
                <button onClick={() => setSel(null)} className="h-10 flex-1 rounded-lg border text-sm font-medium hover:bg-muted">Close</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { toast.success("Changes saved"); setSel(null); }} className="h-10 flex-1 rounded-lg bg-steel text-sm font-medium text-primary-foreground">Edit record</motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
