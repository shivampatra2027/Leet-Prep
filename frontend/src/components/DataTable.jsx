import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button.jsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination.jsx";

// --- SEO-Friendly Logo Component ---
// Handles lazy loading, layout shifts (CLS), and error fallbacks
const logoApiUrl = import.meta.env.VITE_LOGO_API_URL; // 
const faviconApiUrl = import.meta.env.VITE_FAVICON_API_URL;
const CompanyLogo = ({ company, className }) => {
  const [hasError, setHasError] = React.useState(false);

  // 1. Sanitize the company name to create a valid domain guess
  // e.g., "Traceable AI" -> "traceableai.com"
  const domain = company 
    ? `${company.toLowerCase().replace(/\s+/g, '')}.com` 
    : null;

  // 2. Google Favicon Service URL
  const logoUrl = domain
    ? `${logoApiUrl}?domain=${domain}`
    : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  // const logoUrl = domain?
    
  // 3. Fallback: Render generic icon if error occurs or domain is invalid
  if (hasError || !domain) {
    return (
      <Building2
        className={`text-muted-foreground ${className}`}
        aria-label={`${company} generic logo`}
      />
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${company} logo`}
      // SEO: Explicit dimensions prevent Cumulative Layout Shift
      width={16}
      height={16}
      // SEO: Lazy loading improves initial page load speed
      loading="lazy"
      className={`rounded object-contain ${className}`}
      // ERROR HANDLING: Switch to icon state immediately on failure
      onError={() => setHasError(true)}
    />
  );
};

export function DataTable({ columns, data, onFilteredCountChange }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [difficultyFilter, setDifficultyFilter] = React.useState("all");
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const [globalSearch, setGlobalSearch] = React.useState("");

  // Memoize unique companies
  const uniqueCompanies = React.useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.companies || []))).sort();
  }, [data]);

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
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const idMatch = item.problemId?.toLowerCase().includes(searchLower);
        const companyMatch = item.companies?.some((company) =>
          company.toLowerCase().includes(searchLower)
        );

        return titleMatch || idMatch || companyMatch;
      });
    }

    return result;
  }, [data, difficultyFilter, companyFilter, globalSearch]);

  // Update filtered count when filteredData changes
  React.useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredData.length);
    }
  }, [filteredData, onFilteredCountChange]);

  // eslint-disable-next-line react-hooks/incompatible-library
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
        {/* Search Input */}
        <Input
          placeholder="Search by title, problem ID, or company..."
          value={globalSearch}
          onChange={(event) => setGlobalSearch(event.target.value)}
          className="max-w-sm"
        />

        {/* Difficulty Select */}
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

        {/* Company Select */}
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {uniqueCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                <div className="flex items-center gap-2">
                  <CompanyLogo company={company} className="w-4 h-4" />
                  <span>{company}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Columns Dropdown */}
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

        {table.getPageCount() > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                .filter((page) => {
                  const currentPage = table.getState().pagination.pageIndex + 1;
                  const totalPages = table.getPageCount();

                  // Show first, last, current, and neighbors
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  const currentPage = table.getState().pagination.pageIndex + 1;
                  const previousPage = arr[idx - 1];

                  // Add ellipsis if there's a gap > 1
                  const showEllipsis = idx > 0 && page - previousPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
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
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}