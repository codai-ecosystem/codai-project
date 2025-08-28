import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { ChevronUp, ChevronDown, MoreHorizontal, Filter, ArrowUpDown, Search } from "lucide-react";

const tableVariants = cva(
    "w-full caption-bottom text-sm",
    {
        variants: {
            variant: {
                default: "border-collapse",
                striped: "border-collapse",
                bordered: "border-collapse border border-slate-200",
                simple: "border-collapse",
            },
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
            app: {
                codai: "border-blue-200",
                memorai: "border-purple-200",
                bancai: "border-green-200",
                romai: "border-red-200",
                ajutai: "border-orange-200",
                controlai: "border-indigo-200",
                studiai: "border-teal-200",
                sociai: "border-pink-200",
                cumparai: "border-cyan-200",
                donai: "border-emerald-200",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

const tableHeaderVariants = cva(
    "border-b text-left font-medium text-slate-500 [&:has([role=checkbox])]:pr-0",
    {
        variants: {
            variant: {
                default: "border-slate-200",
                subtle: "border-slate-100 bg-slate-50",
                bold: "border-slate-300 bg-slate-100 font-semibold",
            },
            app: {
                codai: "border-blue-200 bg-blue-50 text-blue-700",
                memorai: "border-purple-200 bg-purple-50 text-purple-700",
                bancai: "border-green-200 bg-green-50 text-green-700",
                romai: "border-red-200 bg-red-50 text-red-700",
                ajutai: "border-orange-200 bg-orange-50 text-orange-700",
                controlai: "border-indigo-200 bg-indigo-50 text-indigo-700",
                studiai: "border-teal-200 bg-teal-50 text-teal-700",
                sociai: "border-pink-200 bg-pink-50 text-pink-700",
                cumparai: "border-cyan-200 bg-cyan-50 text-cyan-700",
                donai: "border-emerald-200 bg-emerald-50 text-emerald-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const tableRowVariants = cva(
    "border-b transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100",
    {
        variants: {
            variant: {
                default: "border-slate-200",
                striped: "border-slate-200 odd:bg-slate-50",
                hover: "border-slate-200 hover:bg-slate-100",
            },
            clickable: {
                true: "cursor-pointer",
                false: "",
            },
            app: {
                codai: "hover:bg-blue-50 data-[state=selected]:bg-blue-100",
                memorai: "hover:bg-purple-50 data-[state=selected]:bg-purple-100",
                bancai: "hover:bg-green-50 data-[state=selected]:bg-green-100",
                romai: "hover:bg-red-50 data-[state=selected]:bg-red-100",
                ajutai: "hover:bg-orange-50 data-[state=selected]:bg-orange-100",
                controlai: "hover:bg-indigo-50 data-[state=selected]:bg-indigo-100",
                studiai: "hover:bg-teal-50 data-[state=selected]:bg-teal-100",
                sociai: "hover:bg-pink-50 data-[state=selected]:bg-pink-100",
                cumparai: "hover:bg-cyan-50 data-[state=selected]:bg-cyan-100",
                donai: "hover:bg-emerald-50 data-[state=selected]:bg-emerald-100",
            },
        },
        defaultVariants: {
            variant: "default",
            clickable: false,
        },
    }
);

const tableCellVariants = cva(
    "p-4 align-middle [&:has([role=checkbox])]:pr-0",
    {
        variants: {
            size: {
                sm: "px-2 py-1",
                md: "px-4 py-2",
                lg: "px-6 py-3",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

export interface ColumnDef<T = unknown> {
    id: string;
    accessorKey?: keyof T;
    header: React.ReactNode | ((props: { column: Column<T> }) => React.ReactNode);
    cell?: (props: { row: Row<T>; getValue: () => any }) => React.ReactNode;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    filterFn?: (row: T, columnId: string, filterValue: any) => boolean;
    sortingFn?: (rowA: T, rowB: T, columnId: string) => number;
    size?: number;
    minSize?: number;
    maxSize?: number;
}

export interface SortingState {
    id: string;
    desc: boolean;
}

export interface ColumnFiltersState {
    id: string;
    value: unknown;
}

export interface Row<T = unknown> {
    id: string;
    original: T;
    getVisibleCells: () => Cell<T>[];
    getIsSelected: () => boolean;
    toggleSelected: (value?: boolean) => void;
}

export interface Cell<T = unknown> {
    id: string;
    column: Column<T>;
    row: Row<T>;
    getValue: () => any;
    renderValue: () => React.ReactNode;
}

export interface Column<T = unknown> {
    id: string;
    columnDef: ColumnDef<T>;
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
    getCanSort: () => boolean;
    getCanFilter: () => boolean;
    setFilterValue: (value: unknown) => void;
    getFilterValue: () => unknown;
}

export interface TableProps<T = unknown>
    extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
    data: T[];
    columns: ColumnDef<T>[];
    app?: AppName;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enableRowSelection?: boolean;
    enablePagination?: boolean;
    pageSize?: number;
    onRowClick?: (row: T) => void;
    onSelectionChange?: (selectedRows: T[]) => void;
    loading?: boolean;
    loadingMessage?: string;
    emptyMessage?: string;
}

export interface TableHeaderProps
    extends React.HTMLAttributes<HTMLTableSectionElement>,
    VariantProps<typeof tableHeaderVariants> {
    app?: AppName;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> { }

export interface TableRowProps
    extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {
    app?: AppName;
    selected?: boolean;
}

export interface TableHeadProps
    extends React.HTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableCellVariants> {
    sortable?: boolean;
    sorted?: "asc" | "desc" | false;
    onSort?: () => void;
}

export interface TableCellProps
    extends React.HTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableCellVariants> {
    colSpan?: number;
}

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> { }

// Table Context
const TableContext = React.createContext<{
    sorting: SortingState[];
    setSorting: React.Dispatch<React.SetStateAction<SortingState[]>>;
    columnFilters: ColumnFiltersState[];
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState[]>>;
    rowSelection: Record<string, boolean>;
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    globalFilter: string;
    setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
    pagination: { pageIndex: number; pageSize: number };
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    app?: AppName;
} | null>(null);

const useTable = () => {
    const context = React.useContext(TableContext);
    if (!context) {
        throw new Error("useTable must be used within a Table");
    }
    return context;
};

// Utility functions
const sortData = <T,>(data: T[], sorting: SortingState[], columns: ColumnDef<T>[]): T[] => {
    if (!sorting.length) return data;

    return [...data].sort((a, b) => {
        for (const sort of sorting) {
            const column = columns.find(col => col.id === sort.id);
            if (!column?.accessorKey) continue;

            const aValue = (a as any)[column.accessorKey];
            const bValue = (b as any)[column.accessorKey];

            let result = 0;
            if (column.sortingFn) {
                result = column.sortingFn(a, b, sort.id);
            } else {
                if (aValue < bValue) result = -1;
                if (aValue > bValue) result = 1;
            }

            if (result !== 0) {
                return sort.desc ? -result : result;
            }
        }
        return 0;
    });
};

const filterData = <T,>(
    data: T[],
    columnFilters: ColumnFiltersState[],
    globalFilter: string,
    columns: ColumnDef<T>[]
): T[] => {
    let filteredData = data;

    // Apply column filters
    columnFilters.forEach(filter => {
        const column = columns.find(col => col.id === filter.id);
        if (column?.filterFn) {
            filteredData = filteredData.filter(row =>
                column.filterFn!(row, filter.id, filter.value)
            );
        } else if (column?.accessorKey) {
            filteredData = filteredData.filter(row => {
                const value = (row as any)[column.accessorKey!];
                return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            });
        }
    });

    // Apply global filter
    if (globalFilter) {
        filteredData = filteredData.filter(row =>
            columns.some(column => {
                if (!column.accessorKey) return false;
                const value = (row as any)[column.accessorKey];
                return String(value).toLowerCase().includes(globalFilter.toLowerCase());
            })
        );
    }

    return filteredData;
};

// Main Table component
const Table = React.forwardRef<HTMLTableElement, TableProps>(
    (
        {
            className,
            data = [],
            columns = [],
            variant,
            size,
            app,
            enableSorting = true,
            enableFiltering = true,
            enableRowSelection = false,
            enablePagination = true,
            pageSize = 10,
            onRowClick,
            onSelectionChange,
            loading = false,
            loadingMessage = "Loading...",
            emptyMessage = "No data available",
            ...props
        },
        ref
    ) => {
        const [sorting, setSorting] = React.useState<SortingState[]>([]);
        const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState[]>([]);
        const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
        const [globalFilter, setGlobalFilter] = React.useState("");
        const [pagination, setPagination] = React.useState({
            pageIndex: 0,
            pageSize: pageSize,
        });

        // Process data
        const processedData = React.useMemo(() => {
            let result = data;

            if (enableFiltering) {
                result = filterData(result, columnFilters, globalFilter, columns);
            }

            if (enableSorting) {
                result = sortData(result, sorting, columns);
            }

            return result;
        }, [data, sorting, columnFilters, globalFilter, columns, enableSorting, enableFiltering]);

        // Paginated data
        const paginatedData = React.useMemo(() => {
            if (!enablePagination) return processedData;

            const start = pagination.pageIndex * pagination.pageSize;
            const end = start + pagination.pageSize;
            return processedData.slice(start, end);
        }, [processedData, pagination, enablePagination]);

        // Selection change effect
        React.useEffect(() => {
            if (onSelectionChange) {
                const selectedRows = data.filter((_, index) => rowSelection[String(index)]);
                onSelectionChange(selectedRows);
            }
        }, [rowSelection, data, onSelectionChange]);

        const totalPages = Math.ceil(processedData.length / pagination.pageSize);

        return (
            <TableContext.Provider
                value={{
                    sorting,
                    setSorting,
                    columnFilters,
                    setColumnFilters,
                    rowSelection,
                    setRowSelection,
                    globalFilter,
                    setGlobalFilter,
                    pagination,
                    setPagination,
                    app,
                }}
            >
                <div className="w-full">
                    {enableFiltering && (
                        <div className="flex items-center py-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                    placeholder="Search all columns..."
                                    value={globalFilter}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-8 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                />
                            </div>
                        </div>
                    )}

                    <div className="rounded-md border border-slate-200 overflow-hidden">
                        <table
                            ref={ref}
                            className={cn(tableVariants({ variant, size, app, className }))}
                            {...props}
                        >
                            <TableHeader variant="subtle" app={app}>
                                <TableRow app={app}>
                                    {enableRowSelection && (
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={Object.keys(rowSelection).length === data.length && data.length > 0}
                                                onChange={(event) => {
                                                    if (event.target.checked) {
                                                        const newSelection: Record<string, boolean> = {};
                                                        data.forEach((_, index) => {
                                                            newSelection[String(index)] = true;
                                                        });
                                                        setRowSelection(newSelection);
                                                    } else {
                                                        setRowSelection({});
                                                    }
                                                }}
                                                className="rounded border-slate-300"
                                            />
                                        </TableHead>
                                    )}
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.id}
                                            size={size}
                                            sortable={enableSorting && column.enableSorting !== false}
                                            sorted={
                                                enableSorting
                                                    ? sorting.find(s => s.id === column.id)?.desc
                                                        ? "desc"
                                                        : sorting.find(s => s.id === column.id)
                                                            ? "asc"
                                                            : false
                                                    : false
                                            }
                                            onSort={
                                                enableSorting && column.enableSorting !== false
                                                    ? () => {
                                                        const existingSort = sorting.find(s => s.id === column.id);
                                                        if (!existingSort) {
                                                            setSorting([{ id: column.id, desc: false }]);
                                                        } else if (!existingSort.desc) {
                                                            setSorting([{ id: column.id, desc: true }]);
                                                        } else {
                                                            setSorting([]);
                                                        }
                                                    }
                                                    : undefined
                                            }
                                        >
                                            {typeof column.header === "function"
                                                ? column.header({ column: { id: column.id } as Column })
                                                : column.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow app={app}>
                                        <TableCell colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="h-24 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-r-transparent mr-2" />
                                                {loadingMessage}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedData.length === 0 ? (
                                    <TableRow app={app}>
                                        <TableCell colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="h-24 text-center">
                                            {emptyMessage}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((row, rowIndex) => (
                                        <TableRow
                                            key={rowIndex}
                                            app={app}
                                            clickable={!!onRowClick}
                                            selected={rowSelection[String(rowIndex)]}
                                            onClick={() => onRowClick?.(row)}
                                            data-state={rowSelection[String(rowIndex)] ? "selected" : undefined}
                                        >
                                            {enableRowSelection && (
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={rowSelection[String(rowIndex)] || false}
                                                        onChange={(event) => {
                                                            setRowSelection(prev => ({
                                                                ...prev,
                                                                [String(rowIndex)]: event.target.checked,
                                                            }));
                                                        }}
                                                        className="rounded border-slate-300"
                                                    />
                                                </TableCell>
                                            )}
                                            {columns.map((column) => (
                                                <TableCell key={column.id} size={size}>
                                                    {column.cell
                                                        ? column.cell({
                                                            row: { id: String(rowIndex), original: row } as Row,
                                                            getValue: () => column.accessorKey ? (row as any)[column.accessorKey] : undefined,
                                                        })
                                                        : column.accessorKey
                                                            ? String((row as any)[column.accessorKey] || "")
                                                            : ""}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </table>
                    </div>

                    {enablePagination && processedData.length > 0 && (
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-slate-500">
                                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, processedData.length)} of{" "}
                                {processedData.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        setPagination(prev => ({
                                            ...prev,
                                            pageIndex: Math.max(0, prev.pageIndex - 1),
                                        }))
                                    }
                                    disabled={pagination.pageIndex === 0}
                                    className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm">
                                    Page {pagination.pageIndex + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() =>
                                        setPagination(prev => ({
                                            ...prev,
                                            pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
                                        }))
                                    }
                                    disabled={pagination.pageIndex >= totalPages - 1}
                                    className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </TableContext.Provider>
        );
    }
);

Table.displayName = "Table";

// Table Header
const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
    ({ className, variant, app, ...props }, ref) => {
        return (
            <thead
                ref={ref}
                className={cn(tableHeaderVariants({ variant, app }), className)}
                {...props}
            />
        );
    }
);

TableHeader.displayName = "TableHeader";

// Table Body
const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
    ({ className, ...props }, ref) => {
        return (
            <tbody
                ref={ref}
                className={cn("[&_tr:last-child]:border-0", className)}
                {...props}
            />
        );
    }
);

TableBody.displayName = "TableBody";

// Table Row
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
    ({ className, variant, clickable, app, selected, ...props }, ref) => {
        return (
            <tr
                ref={ref}
                className={cn(tableRowVariants({ variant, clickable, app }), className)}
                data-state={selected ? "selected" : undefined}
                {...props}
            />
        );
    }
);

TableRow.displayName = "TableRow";

// Table Head
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
    ({ className, size, sortable, sorted, onSort, children, ...props }, ref) => {
        return (
            <th
                ref={ref}
                className={cn(
                    tableCellVariants({ size }),
                    "text-left font-medium text-slate-500",
                    sortable && "cursor-pointer select-none hover:text-slate-600",
                    className
                )}
                onClick={sortable ? onSort : undefined}
                {...props}
            >
                <div className="flex items-center space-x-2">
                    <span>{children}</span>
                    {sortable && (
                        <div className="flex flex-col">
                            {sorted === false && <ArrowUpDown className="h-3 w-3 text-slate-400" />}
                            {sorted === "asc" && <ChevronUp className="h-3 w-3 text-slate-600" />}
                            {sorted === "desc" && <ChevronDown className="h-3 w-3 text-slate-600" />}
                        </div>
                    )}
                </div>
            </th>
        );
    }
);

TableHead.displayName = "TableHead";

// Table Cell
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ className, size, ...props }, ref) => {
        return (
            <td
                ref={ref}
                className={cn(tableCellVariants({ size }), className)}
                {...props}
            />
        );
    }
);

TableCell.displayName = "TableCell";

// Table Caption
const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <caption
                ref={ref}
                className={cn("mt-4 text-sm text-slate-500", className)}
                {...props}
            />
        );
    }
);

TableCaption.displayName = "TableCaption";

// Data Table - Advanced table with built-in features
export interface DataTableProps<T = unknown> extends Omit<TableProps<T>, 'columns'> {
    columns: ColumnDef<T>[];
    searchPlaceholder?: string;
    showPagination?: boolean;
    showRowSelection?: boolean;
    showGlobalFilter?: boolean;
}

const DataTable = <T,>({
    data,
    columns,
    searchPlaceholder = "Search...",
    showPagination = true,
    showRowSelection = false,
    showGlobalFilter = true,
    app,
    ...props
}: DataTableProps<T>) => {
    return (
        <Table
            data={data as unknown[]}
            columns={columns as ColumnDef<unknown>[]}
            app={app}
            enablePagination={showPagination}
            enableRowSelection={showRowSelection}
            enableFiltering={showGlobalFilter}
            {...props}
        />
    );
};

// Simple Table - Minimal table for basic use cases
export interface SimpleTableProps<T = unknown> {
    data: T[];
    columns: Array<{
        key: keyof T;
        header: string;
        render?: (value: any, row: T) => React.ReactNode;
    }>;
    app?: AppName;
    className?: string;
}

const SimpleTable = <T,>({ data, columns, app, className }: SimpleTableProps<T>) => {
    const tableColumns: ColumnDef<unknown>[] = columns.map(col => ({
        id: String(col.key),
        accessorKey: col.key as keyof unknown,
        header: col.header,
        cell: col.render ? ({ row, getValue }) => col.render!(getValue(), row.original as T) : undefined,
    }));

    return (
        <Table
            data={data as unknown[]}
            columns={tableColumns}
            app={app}
            enableSorting={false}
            enableFiltering={false}
            enablePagination={false}
            className={className}
        />
    );
};

export {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
    DataTable,
    SimpleTable,
    tableVariants,
    tableHeaderVariants,
    tableRowVariants,
    tableCellVariants,
};
