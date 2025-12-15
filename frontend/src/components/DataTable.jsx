import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
const logoApiBase = import.meta.env.VITE_LOGO_API_BASE;
export function DataTable({ columns, data, onFilteredCountChange }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [difficultyFilter, setDifficultyFilter] = React.useState("all");
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const [globalSearch, setGlobalSearch] = React.useState("");


  // Filter data based on difficulty, company, and global search
  const filteredData = React.useMemo(() => {
    let result = data;
    
    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter((item) => item.difficulty === difficultyFilter);
    }

    // Apply company filter
    if (companyFilter !== "all") {
      result = result.filter((item) =>
        item.companies?.includes(companyFilter)
      );
    }

    // Apply global search (title, problemId, companies)
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter((item) => {
        // Search in title
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        
        // Search in problemId
        const idMatch = item.problemId?.toLowerCase().includes(searchLower);
        
        // Search in companies array
        const companyMatch = item.companies?.some(company => 
          company.toLowerCase().includes(searchLower)
        );
        
        return titleMatch || idMatch || companyMatch;
      });
    }

    return result;
  }, [data, difficultyFilter, companyFilter, globalSearch]);
  const [logos, setLogos] = React.useState({});
  React.useEffect(() => {
    const companies = Array.from(new Set(data.flatMap((d) => d.companies || [])));

    companies.forEach(async (company) => {
      try {
        const res = await fetch(`${logoApiBase}${company.toLowerCase()}.com`);
        const json = await res.json();
        setLogos((prev) => ({ ...prev, [company]: json.logo_url }));
      } catch (err) {
        console.error("Failed to fetch logo for", company, err);
      }
    });
  }, [data]);
  // Update filtered count when filteredData changes
  React.useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredData.length);
    }
  }, [filteredData, onFilteredCountChange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 30,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search by title, problem ID, or company..."
          value={globalSearch}
          onChange={(event) => setGlobalSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {Array.from(new Set(data.flatMap((d) => d.companies || []))).map((company) => (
              <SelectItem key={company} value={company}>
                <div className="flex items-center gap-2">
                  <img
                    src={logos[company]}  
                    alt={company}
                    className="w-4 h-4 rounded"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span>{company}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
              .filter((page) => {
                const currentPage = table.getState().pagination.pageIndex + 1;
                const totalPages = table.getPageCount();

                // Always show first page, last page, current page, and pages around current
                if (page === 1 || page === totalPages ||
                  Math.abs(page - currentPage) <= 1) {
                  return true;
                }
                return false;
              })
              .map((page, idx, arr) => {
                const currentPage = table.getState().pagination.pageIndex + 1;

                // Add ellipsis if there's a gap
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <React.Fragment key={`group-${page}`}>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => table.setPageIndex(page - 1)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => table.setPageIndex(page - 1)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
