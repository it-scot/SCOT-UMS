import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => ReactNode;
  className?: string;
};

type SortState = { id: string; dir: "asc" | "desc" };

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  onRowClick,
  actions,
  pageSize = 5,
  emptyLabel = "No records match your filters.",
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  pageSize?: number;
  emptyLabel?: string;
}) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(0);
  const signature = rows.map((row) => row.id).join("|");

  useEffect(() => {
    setPage(0);
  }, [signature]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.id === sort.id);
    if (!column?.sortValue) return rows;
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((left, right) => {
      const a = column.sortValue?.(left);
      const b = column.sortValue?.(right);
      if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
      return String(a).localeCompare(String(b)) * direction;
    });
  }, [columns, rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  const toggleSort = (id: string) => {
    setSort((current) => {
      if (!current || current.id !== id) return { id, dir: "asc" };
      if (current.dir === "asc") return { id, dir: "desc" };
      return null;
    });
  };

  if (sorted.length === 0) {
    return <p className="p-10 text-center text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-wider text-slate-500 uppercase">
            <tr className="border-b border-slate-200 dark:border-white/10">
              {columns.map((column) => (
                <th key={column.id} className={cn("px-4 py-3 font-medium", column.className)}>
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className="inline-flex items-center gap-1"
                      aria-sort={
                        sort?.id === column.id
                          ? sort.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      {column.header}
                      {sort?.id === column.id ? (
                        sort.dir === "asc" ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-slate-200 last:border-0 dark:border-white/10",
                  onRowClick && "cursor-pointer hover:bg-muted/70",
                )}
              >
                {columns.map((column) => (
                  <td key={column.id} className={cn("px-4 py-3", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 md:hidden">
        {visible.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onRowClick?.(row)}
            className="w-full rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm dark:border-white/10 dark:bg-[#0f1b33]"
          >
            <div className="space-y-2">
              {columns.slice(0, 4).map((column) => (
                <div key={column.id} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] tracking-wide text-slate-500 uppercase">
                    {column.header}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{column.cell(row)}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10">
        <span>
          Showing {start + 1}–{start + visible.length} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 font-medium disabled:opacity-40 dark:border-white/10"
          >
            Previous
          </button>
          <span>
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 font-medium disabled:opacity-40 dark:border-white/10"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
