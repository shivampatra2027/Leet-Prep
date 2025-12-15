import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const logoApiBase = import.meta.env.VITE_LOGO_API_BASE;

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "problemId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("problemId")}</div>,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const problem = row.original;
      return (
        <div className="flex flex-col gap-1">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-blue-600 font-medium"
          >
            {problem.title}
          </a>

          <div className="flex flex-wrap gap-2">
            {problem.companies?.slice(0, 3).map((company, idx) => (
              <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100">
                <img
                  src={`${logoApiBase}${company.toLowerCase()}.com`}
                  alt={company}
                  className="w-4 h-4 rounded"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <span className="text-xs text-gray-600">{company}</span>
              </div>
            ))}
          </div>

        </div>
      );
    },
  },
  {
    accessorKey: "acceptance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Acceptance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const acceptance = row.getValue("acceptance");
      return <div>{acceptance ? `${acceptance}%` : "N/A"}</div>;
    },
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty");
      const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
          case "easy":
            return "text-green-600 bg-green-50";
          case "medium":
            return "text-yellow-600 bg-yellow-50";
          case "hard":
            return "text-red-600 bg-red-50";
          default:
            return "text-gray-600 bg-gray-50";
        }
      };
      return (
        <span className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </span>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const problem = row.original;
      const tags = problem.topics || [];

      if (!tags.length) {
        return <span className="text-gray-400 text-sm">No tags</span>;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-2 py-1">
              {tags.length > 0 ? `${tags.length} Tags` : "Tags"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Problem Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.map((tag, idx) => (
              <DropdownMenuItem key={idx}>
                <span className="text-sm">{tag}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const problem = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(problem.problemId.toString())}
            >
              Copy problem ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(problem.url, "_blank")}>
              View problem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
