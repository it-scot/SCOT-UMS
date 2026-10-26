import { useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, MoreHorizontal, Phone, Search } from "lucide-react";
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
import { employeeQueryKey, useEmployees } from "@/hooks/use-erp-data";
import type { Employee, EmployeeStatus } from "@/types/erp";
import { initials } from "@/utils/format";
import { cardClass, ghostButtonClass, primaryButtonClass } from "@/utils/styles";

const filters = ["All", "Active", "On Leave"] as const;

export function HrDashboard() {
  const queryClient = useQueryClient();
  const query = useEmployees();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<Employee | null>(null);
  const rows = query.data ?? [];

  const list = useMemo(
    () =>
      rows.filter((row) => {
        const matchesFilter = filter === "All" || row.status === filter;
        const haystack = `${row.name} ${row.id} ${row.department} ${row.role}`.toLowerCase();
        return matchesFilter && haystack.includes(term.toLowerCase());
      }),
    [filter, rows, term],
  );

  const onLeave = rows.filter((row) => row.status === "On Leave").length;
  const departments = new Set(rows.map((row) => row.department)).size;

  const setStatus = (employee: Employee, status: EmployeeStatus) => {
    const next = rows.map((row) => (row.id === employee.id ? { ...row, status } : row));
    queryClient.setQueryData(employeeQueryKey, next);
    setSelected((current) => (current?.id === employee.id ? { ...current, status } : current));
    toast.success(`${employee.name} marked ${status}`);
  };

  const columns = useMemo<Column<Employee>[]>(
    () => [
      {
        id: "name",
        header: "Employee",
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => (
          <span className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-accent text-[11px] font-semibold text-steel">
              {initials(row.name)}
            </span>
            <span>
              <span className="block font-medium text-slate-900 dark:text-white">{row.name}</span>
              <span className="block text-xs text-slate-500">{row.role}</span>
            </span>
          </span>
        ),
      },
      {
        id: "department",
        header: "Department",
        sortable: true,
        sortValue: (row) => row.department,
        cell: (row) => <span className="text-slate-500">{row.department}</span>,
      },
      {
        id: "email",
        header: "Email",
        sortable: true,
        sortValue: (row) => row.email,
        cell: (row) => row.email,
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
      <PageHeader eyebrow="Human Resources" title="HR Dashboard" />
      {query.isError && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          The people directory could not be refreshed. Showing the last available records.
        </p>
      )}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SurfaceCard>
          <p className="text-xs text-slate-500">Headcount</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{rows.length}</p>
        </SurfaceCard>
        <SurfaceCard delay={0.05}>
          <p className="text-xs text-slate-500">On leave</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{onLeave}</p>
        </SurfaceCard>
        <SurfaceCard delay={0.1}>
          <p className="text-xs text-slate-500">Departments</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{departments}</p>
        </SurfaceCard>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Filter by name, ID, department…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-secondary/40 dark:border-white/10 dark:bg-[#0f1b33]"
            />
          </div>
          <FilterBar
            options={filters}
            value={filter}
            onChange={(value) => setFilter(value)}
            layoutId="hr-filter"
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
                <DropdownMenuItem onSelect={() => setSelected(row)}>View profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatus(row, "On Leave")}>
                  Mark on leave
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatus(row, "Active")}>
                  Mark active
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </div>

      <DetailDrawer
        open={selected !== null}
        title={selected?.name ?? ""}
        {...(selected
          ? { subtitle: `${selected.role} · ${selected.id}`, badge: initials(selected.name) }
          : {})}
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
                setStatus(selected, selected.status === "On Leave" ? "Active" : "On Leave");
              }}
            >
              {selected?.status === "On Leave" ? "Mark active" : "Mark on leave"}
            </button>
          </>
        }
      >
        {selected && (
          <>
            <StatusPill status={selected.status} />
            {(
              [
                [Building2, "Department", selected.department],
                [Mail, "Email", selected.email],
                [Phone, "Extension", selected.extension],
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
          </>
        )}
      </DetailDrawer>
    </div>
  );
}
