import { useQueryClient } from "@tanstack/react-query";
import { Laptop, MoreHorizontal, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { DetailDrawer } from "@/components/erp/DetailDrawer";
import { FilterBar } from "@/components/erp/FilterBar";
import { StatusPill } from "@/components/erp/StatusPill";
import { SurfaceCard } from "@/components/erp/SurfaceCard";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assetQueryKey, useAssets } from "@/hooks/use-erp-data";
import type { Asset, AssetStatus } from "@/types/erp";
import { cardClass, ghostButtonClass, primaryButtonClass } from "@/utils/styles";

const filters = ["All", "Assigned", "Active", "Repair", "Critical"] as const;

export function AdminLogistics() {
  const queryClient = useQueryClient();
  const query = useAssets();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<Asset | null>(null);
  const rows = query.data ?? [];

  const list = useMemo(
    () =>
      rows.filter((row) => {
        const matchesFilter = filter === "All" || row.status === filter;
        const haystack = `${row.name} ${row.serial} ${row.assignee} ${row.department}`.toLowerCase();
        return matchesFilter && haystack.includes(term.toLowerCase());
      }),
    [filter, rows, term],
  );

  const repair = rows.filter((row) => row.status === "Repair").length;
  const critical = rows.filter((row) => row.status === "Critical").length;

  const setStatus = (asset: Asset, status: AssetStatus, message: string) => {
    const next = rows.map((row) => (row.id === asset.id ? { ...row, status } : row));
    queryClient.setQueryData(assetQueryKey, next);
    setSelected((current) => (current?.id === asset.id ? { ...current, status } : current));
    if (status === "Repair" || status === "Critical") toast.error(message);
    else toast.success(message);
  };

  const columns = useMemo<Column<Asset>[]>(
    () => [
      {
        id: "name",
        header: "Asset",
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>,
      },
      {
        id: "assignee",
        header: "Assignee",
        sortable: true,
        sortValue: (row) => row.assignee,
        cell: (row) => (
          <span>
            <span className="block">{row.assignee}</span>
            <span className="block text-xs text-slate-500">{row.department}</span>
          </span>
        ),
      },
      {
        id: "serial",
        header: "Serial",
        sortable: true,
        sortValue: (row) => row.serial,
        cell: (row) => (
          <code className="rounded-md border border-slate-200 bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            {row.serial}
          </code>
        ),
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => <StatusPill status={row.status} />,
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Facilities" title="Admin & Logistics" />
      {query.isError && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          The asset register could not be refreshed. Showing the last available records.
        </p>
      )}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SurfaceCard>
          <p className="text-xs text-slate-500">Tracked assets</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{rows.length}</p>
        </SurfaceCard>
        <SurfaceCard delay={0.05}>
          <p className="text-xs text-slate-500">In repair</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{repair}</p>
        </SurfaceCard>
        <SurfaceCard delay={0.1}>
          <p className="text-xs text-slate-500">Critical</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{critical}</p>
        </SurfaceCard>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Filter by asset, serial, assignee…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-secondary/40 dark:border-white/10 dark:bg-[#0f1b33]"
            />
          </div>
          <FilterBar
            options={filters}
            value={filter}
            onChange={(value) => setFilter(value)}
            layoutId="admin-filter"
          />
          <span className="ml-auto text-xs text-slate-500">{list.length} records</span>
        </div>
        <DataTable
          rows={list}
          columns={columns}
          onRowClick={setSelected}
          actions={(row) => (
            <DropdownMenu>
              <DropdownMenuTrigger className="grid size-8 place-items-center rounded-md hover:bg-accent">
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSelected(row)}>View details</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Asset reassignment opened")}>
                  Reassign asset
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setStatus(row, "Repair", "Marked for repair")}
                >
                  Mark for repair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </div>

      <DetailDrawer
        open={selected !== null}
        title={selected?.name ?? ""}
        {...(selected ? { subtitle: selected.serial, badge: selected.name.slice(0, 1) } : {})}
        onClose={() => setSelected(null)}
        footer={
          <>
            <button type="button" onClick={() => setSelected(null)} className={`${ghostButtonClass} flex-1`}>
              Close
            </button>
            <button
              type="button"
              className={`${primaryButtonClass} flex-1`}
              onClick={() => {
                if (!selected) return;
                setStatus(selected, "Repair", "Marked for repair");
              }}
            >
              Mark for repair
            </button>
          </>
        }
      >
        {selected && (
          <>
            <StatusPill status={selected.status} />
            {(
              [
                [UserRound, "Assignee", `${selected.assignee} · ${selected.assigneeId}`],
                [Laptop, "Department", selected.department],
              ] as const
            ).map(([Icon, label, value]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-muted">
                  <Icon className="size-4 text-slate-500" />
                </span>
                <span>
                  <span className="block text-xs text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{value}</span>
                </span>
              </div>
            ))}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <div className="text-xs text-slate-500">Serial number</div>
              <code className="font-mono text-slate-900 dark:text-white">{selected.serial}</code>
              <div className="mt-3 text-xs text-slate-500">
                Warranty until {selected.warranty} · Last audited Sep 2026
              </div>
            </div>
          </>
        )}
      </DetailDrawer>
    </div>
  );
}
