import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Insight = {
    _id: string
    job_id: string
    insight_details: {
      captcha_detected: boolean
      captcha_solved: boolean
      detected_time: string
      solved_time: string | null
      error_text: string | null
    }
  }
  

  export const columns: ColumnDef<Insight>[] = [
    {
      header: "Job ID",
      cell: ({ row }) => (
        <div className="text-center">{row.original.job_id?.slice(0, 8) || "N/A"
        }</div>
      ),
    },
    {
      accessorKey: "insight_type",
      header: "Insight Type",
      cell: ({ row }) => <div className="capitalize text-center">{row.getValue("insight_type")}</div>,
    },
    {
      accessorKey: "insight_details.captcha_detected",
      header: "Captcha Detected",
      cell: ({ row }) => (
        <div className="text-center">{row.original.insight_details?.captcha_detected ? "Yes" : "No"}</div>
      ),
    },
    {
      accessorKey: "insight_details.captcha_solved",
      header: "Captcha Solved",
      cell: ({ row }) => (
        <div className="text-center">{row.original.insight_details?.captcha_solved ? "Yes" : "No"}</div>
      ),
    },
    {
      accessorKey: "insight_details.detected_time",
      header: "Detected Time",
      cell: ({ row }) => <div className="text-left">{row.original.insight_details?.detected_time || "N/A"}</div>,
    },
    {
      accessorKey: "insight_details.solved_time",
      header: "Solved Time",
      cell: ({ row }) => <div className="text-left">{row.original.insight_details?.solved_time || "N/A"}</div>,
    },
    {
      accessorKey: "insight_details.error_text",
      header: "Error Text",
      cell: ({ row }) => <div className="text-left">{row.original.insight_details?.error_text || "None"}</div>,
    },
  ];
  
  

export function ProxyTable({data, setPageIndex, pageIndex}: {data: Insight[], setPageIndex: any, pageIndex: number}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by Job ID"
          value={(table.getColumn("job_id")?.getFilterValue() as string) ?? ""}
          onChange={(event: any) =>
            table.getColumn("job_id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
