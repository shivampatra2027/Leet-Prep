import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Building2, Tag } from "lucide-react";

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
const logoApiBase = import.meta.env.VITE_LOGO_API_BASE;
const logoApiToken = import.meta.env.VITE_LOGO_API_TOKEN;

const CompanyLogo = ({ company, className }) => {
  const [hasError, setHasError] = React.useState(false);

  const domain = company
    ? `${company.toLowerCase().replace(/\s+/g, "")}.com`
    : null;

  const logoUrl =
    domain && !hasError
      ? `${logoApiBase}/${domain}?token=${logoApiToken}`
      : null;

  if (hasError || !domain) {
    return (
      <Building2
        className={`text-muted-foreground ${className}`}
        aria-label={`${company || "Company"} logo`}
      />
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${company} logo`}
      className={`w-4 h-4 rounded object-contain ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export function DataTable({ columns, data, onFilteredCountChange, solvedProblems = [] }) {
  const [sorting, setSorting] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [difficultyFilter, setDifficultyFilter] = React.useState("all");
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [topicFilters, setTopicFilters] = React.useState([]);

  // Memoized unique values
  const uniqueCompanies = React.useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.companies || []))).sort();
  }, [data]);

  const uniqueTopics = React.useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.topics || []))).sort();
  }, [data]);

  // Filtered data
  const filteredData = React.useMemo(() => {
    let result = data;

    if (difficultyFilter !== "all") {
      result = result.filter((item) => item.difficulty === difficultyFilter);
    }

    if (companyFilter !== "all") {
      result = result.filter((item) => item.companies?.includes(companyFilter));
    }

    if (topicFilters.length > 0) {
      result = result.filter((item) =>
        item.topics?.some((topic) => topicFilters.includes(topic))
      );
    }

    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const idMatch = item.problemId?.toString().toLowerCase().includes(searchLower);
        const companyMatch = item.companies?.some((c) => c.toLowerCase().includes(searchLower));
        const topicMatch = item.topics?.some((t) => t.toLowerCase().includes(searchLower));

        return titleMatch || idMatch || companyMatch || topicMatch;
      });
    }

    return result;
  }, [data, difficultyFilter, companyFilter, topicFilters, globalSearch]);

  React.useEffect(() => {
    onFilteredCountChange?.(filteredData.length);
  }, [filteredData.length, onFilteredCountChange]);

  // Enhance data with solved status
  const enhancedData = React.useMemo(() => {
    return filteredData.map(problem => ({
      ...problem,
      isSolved: solvedProblems.includes(problem.problemId) || 
                solvedProblems.some(slug => problem.url?.includes(slug))
    }));
  }, [filteredData, solvedProblems]);

  const table = useReactTable({
    data: enhancedData,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 30 } },
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by title, ID, company, or topic..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="w-full max-w-sm bg-muted/30 hover:bg-muted/50 transition:colors"
        />

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[180px] cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
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
          <SelectTrigger className="w-[220px] cursor-pointer bg-muted/30 transition-colors hover:bg-muted/50 transition-colors">
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

        {/* Topics Dropdown with Count */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[220px] cursor-pointer bg-muted/30 transition-colors hover:bg-muted/50 transition-colors">
              {topicFilters.length > 0 ? `Topics (${topicFilters.length})` : "All Topics"}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[260px] max-h-[300px] overflow-y-auto">
            {uniqueTopics.map((topic) => {
              const count = data.filter((item) => item.topics?.includes(topic)).length;

              return (
                <DropdownMenuCheckboxItem
                  key={topic}
                  checked={topicFilters.includes(topic)}
                  onCheckedChange={(checked) =>
                    setTopicFilters(
                      checked
                        ? [...topicFilters, topic]
                        : topicFilters.filter((t) => t !== topic)
                    )
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 " />
                  <span className="flex-1 truncate">{topic}</span>
                  <span className="ml-2 text-sm text-muted-foreground">({count})</span>
                </DropdownMenuCheckboxItem>
              );
            })}
            {uniqueTopics.length > 0 && (
              <DropdownMenuCheckboxItem
                checked={topicFilters.length === 0}
                onCheckedChange={() => setTopicFilters([])}
                onSelect={(e) => e.preventDefault()}
                className="mt-2 border-t pt-2 font-medium"
              >
                <Tag className="mr-2 h-4 w-4 text-muted-foreground opacity-50" />
                Clear selection
              </DropdownMenuCheckboxItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-gradient-to-br from-background via-muted/40 to-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Selection Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        {table.getPageCount() > 1 && (
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
                  const current = table.getState().pagination.pageIndex + 1;
                  const total = table.getPageCount();
                  return page === 1 || page === total || Math.abs(page - current) <= 1;
                })
                .map((page, idx, arr) => {
                  const current = table.getState().pagination.pageIndex + 1;
                  const prev = arr[idx - 1];
                  const showEllipsis = idx > 0 && page - prev > 1;

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
                          isActive={current === page}
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
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}