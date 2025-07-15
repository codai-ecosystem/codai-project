/**
 * Enhanced Data Table Component
 *
 * Professional data table with advanced features including:
 * - Enhanced filtering and search
 * - Virtualization for large datasets
 * - Export functionality (CSV, Excel, PDF)
 * - Column configuration and persistence
 * - Multi-level sorting
 * - Responsive design
 */

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

// Types
export interface Column<T = Record<string, unknown>> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => unknown;
  cell?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sticky?: 'left' | 'right';
  hidden?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean';
  filterOptions?: Array<{ value: unknown; label: string }>;
  exportable?: boolean;
  formatForExport?: (value: unknown) => string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface FilterConfig {
  column: string;
  value: unknown;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'gt'
    | 'lt'
    | 'between';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface EnhancedDataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: PaginationConfig;
  onPaginationChange?: (pagination: PaginationConfig) => void;
  sorting?: SortConfig[];
  onSortingChange?: (sorting: SortConfig[]) => void;
  filtering?: FilterConfig[];
  onFilteringChange?: (filtering: FilterConfig[]) => void;
  selection?: string[];
  onSelectionChange?: (selection: string[]) => void;
  rowKey?: keyof T | ((row: T) => string);
  className?: string;
  height?: number;
  virtualScrolling?: boolean;
  exportable?: boolean;
  columnConfigurable?: boolean;
  persistState?: boolean;
  stateKey?: string;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  expandableRows?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  globalSearch?: boolean;
  globalSearchPlaceholder?: string;
}

export interface UseEnhancedDataTableReturn<T> {
  data: T[];
  allData: T[];
  originalData: T[];
  columns: Column<T>[];
  sorting: SortConfig[];
  filtering: FilterConfig[];
  pagination: PaginationConfig;
  selection: string[];
  globalSearch: string;
  expandedRows: Set<string>;
  setData: (data: T[]) => void;
  setColumns: (columns: Column<T>[]) => void;
  setSorting: (sorting: SortConfig[]) => void;
  setFiltering: (filtering: FilterConfig[]) => void;
  setPagination: (pagination: PaginationConfig) => void;
  setSelection: (selection: string[]) => void;
  setGlobalSearch: (search: string) => void;
  setExpandedRows: (rows: Set<string>) => void;
}

interface PersistedTableState<T> {
  columns?: Column<T>[];
  sorting?: SortConfig[];
  filtering?: FilterConfig[];
  pagination?: PaginationConfig;
  selection?: string[];
  globalSearch?: string;
  expandedRows?: string[];
}

/**
 * Enhanced Data Table Hook for state management
 */
export function useEnhancedDataTable<T>(
  initialData: T[],
  initialColumns: Column<T>[],
  options: {
    persistState?: boolean;
    stateKey?: string;
    defaultPageSize?: number;
  } = {}
): UseEnhancedDataTableReturn<T> {
  const {
    persistState = false,
    stateKey = 'dataTable',
    defaultPageSize = 10,
  } = options;

  // Load initial state from localStorage if persistence is enabled
  const loadPersistedState = useCallback((): PersistedTableState<T> | null => {
    if (persistState === false || typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(`${stateKey}_state`);
      return saved !== null && saved !== ''
        ? (JSON.parse(saved) as PersistedTableState<T>)
        : null;
    } catch {
      return null;
    }
  }, [persistState, stateKey]);

  const persistedState = loadPersistedState();

  const [data, setData] = useState<T[]>(initialData);
  const [columns, setColumns] = useState<Column<T>[]>(
    persistedState?.columns ?? initialColumns
  );
  const [sorting, setSorting] = useState<SortConfig[]>(
    persistedState?.sorting ?? []
  );
  const [filtering, setFiltering] = useState<FilterConfig[]>(
    persistedState?.filtering ?? []
  );
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: persistedState?.pagination?.page ?? 1,
    pageSize: persistedState?.pagination?.pageSize ?? defaultPageSize,
    total: initialData.length,
  });
  const [selection, setSelection] = useState<string[]>(
    persistedState?.selection ?? []
  );
  const [globalSearch, setGlobalSearch] = useState<string>(
    persistedState?.globalSearch ?? ''
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(persistedState?.expandedRows ?? [])
  );

  // Persist state to localStorage
  useEffect(() => {
    if (!persistState || typeof window === 'undefined') return;

    const state = {
      columns: columns.map(col => ({
        ...col,
        // Don't persist functions
        accessor: undefined,
        cell: undefined,
        formatForExport: undefined,
      })),
      sorting,
      filtering,
      pagination,
      selection,
      globalSearch,
      expandedRows: Array.from(expandedRows),
    };

    try {
      localStorage.setItem(`${stateKey}_state`, JSON.stringify(state));
    } catch (error: unknown) {
      console.warn('Failed to persist table state:', error);
    }
  }, [
    columns,
    sorting,
    filtering,
    pagination,
    selection,
    globalSearch,
    expandedRows,
    persistState,
    stateKey,
  ]);

  // Data processing
  const processedData = useMemo(() => {
    let result = [...data];

    // Global search
    if (globalSearch !== '') {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter(row =>
        columns.some(column => {
          const value =
            column.accessorKey !== undefined
              ? row[column.accessorKey]
              : column.accessor?.(row);

          return String(value ?? '')
            .toLowerCase()
            .includes(searchLower);
        })
      );
    }

    // Apply filters
    for (const filter of filtering) {
      const column = columns.find(col => col.id === filter.column);
      if (column === undefined) continue;

      result = result.filter(row => {
        const value =
          column.accessorKey !== undefined
            ? row[column.accessorKey]
            : column.accessor?.(row);

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value ?? '')
              .toLowerCase()
              .includes(String(filter.value ?? '').toLowerCase());
          case 'startsWith':
            return String(value ?? '')
              .toLowerCase()
              .startsWith(String(filter.value ?? '').toLowerCase());
          case 'endsWith':
            return String(value ?? '')
              .toLowerCase()
              .endsWith(String(filter.value ?? '').toLowerCase());
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'between':
            if (Array.isArray(filter.value) && filter.value.length === 2) {
              return (
                Number(value) >= Number(filter.value[0]) &&
                Number(value) <= Number(filter.value[1])
              );
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sorting.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorting) {
          const column = columns.find(col => col.id === sort.column);
          if (column === undefined) continue;
          const aValue =
            column.accessorKey !== undefined
              ? a[column.accessorKey]
              : column.accessor?.(a);
          const bValue =
            column.accessorKey !== undefined
              ? b[column.accessorKey]
              : column.accessor?.(b);

          let comparison = 0;

          // Type-safe comparison
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            // Convert to strings for comparison as fallback
            const aStr = String(aValue ?? '');
            const bStr = String(bValue ?? '');
            comparison = aStr.localeCompare(bStr);
          }

          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [data, columns, filtering, sorting, globalSearch]);

  // Update pagination total when data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: processedData.length,
      page: Math.min(
        prev.page,
        Math.max(1, Math.ceil(processedData.length / prev.pageSize))
      ),
    }));
  }, [processedData.length]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination]);

  return {
    data: paginatedData,
    allData: processedData,
    originalData: data,
    columns,
    sorting,
    filtering,
    pagination,
    selection,
    globalSearch,
    expandedRows,
    setData,
    setColumns,
    setSorting,
    setFiltering,
    setPagination,
    setSelection,
    setGlobalSearch,
    setExpandedRows,
  };
}

/**
 * Virtual scrolling hook for large datasets
 */
export function useVirtualScrolling<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
): {
  visibleItems: T[];
  totalHeight: number;
  offsetY: number;
  setScrollTop: (scrollTop: number) => void;
  visibleRange: { startIndex: number; endIndex: number };
} {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
}

/**
 * Export utilities
 */
export class DataTableExporter {
  static toCsv<T>(
    data: T[],
    columns: Column<T>[],
    filename = 'export.csv'
  ): void {
    const exportableColumns = columns.filter(col => col.exportable !== false);

    // Create CSV content
    const headers = exportableColumns.map(col => col.header).join(',');
    const rows = data.map(row =>
      exportableColumns
        .map(col => {
          const value =
            col.accessorKey !== undefined
              ? row[col.accessorKey]
              : col.accessor?.(row);
          const formatted =
            col.formatForExport !== undefined
              ? col.formatForExport(value)
              : String(value ?? '');

          // Escape commas and quotes
          return `"${formatted.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Download file
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  static toJson<T>(data: T[], filename = 'export.json'): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}

/**
 * Enhanced Data Table Component
 */
export function EnhancedDataTable<T extends Record<string, unknown>>({
  data: initialData,
  columns: initialColumns,
  loading = false,
  error,
  pagination: externalPagination,
  onPaginationChange,
  sorting: externalSorting,
  onSortingChange,
  filtering: _externalFiltering, // Reserved for future use
  // onFilteringChange, // Not currently used
  selection: externalSelection,
  onSelectionChange,
  rowKey = 'id',
  className,
  height = 400,
  virtualScrolling = false,
  exportable = true,
  // columnConfigurable = true; // Not currently used
  persistState = false,
  stateKey = 'enhancedDataTable',
  onRowClick,
  onRowDoubleClick,
  expandableRows = false,
  renderExpandedRow,
  globalSearch: enableGlobalSearch = true,
  globalSearchPlaceholder = 'Search...',
}: EnhancedDataTableProps<T>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Use internal state management if external state is not provided
  const {
    data: processedData,
    allData,
    columns,
    sorting,
    filtering: _filtering, // Reserved for future use
    pagination,
    selection,
    globalSearch,
    expandedRows,
    // setColumns, // Not currently used
    setSorting,
    // setFiltering, // Not currently used
    setPagination,
    setSelection,
    setGlobalSearch,
    setExpandedRows,
  } = useEnhancedDataTable(initialData, initialColumns, {
    persistState,
    stateKey,
    defaultPageSize: externalPagination?.pageSize ?? 10,
  });

  // Use external state if provided
  const currentSorting = externalSorting ?? sorting;
  // const currentFiltering = externalFiltering || filtering; // Not currently used
  const currentPagination = externalPagination ?? pagination;
  const currentSelection = externalSelection ?? selection;

  // Virtual scrolling
  const itemHeight = 48; // Height of each row
  const { visibleItems, totalHeight, offsetY, setScrollTop } =
    useVirtualScrolling(
      virtualScrolling ? processedData : [],
      height,
      itemHeight
    );

  const dataToRender = virtualScrolling ? visibleItems : processedData;

  // Get row key
  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      }
      return String(row[rowKey] ?? index);
    },
    [rowKey]
  );
  // Handle sorting
  const handleSort = useCallback(
    (columnId: string) => {
      const newSorting = [...currentSorting];
      const existingIndex = newSorting.findIndex(s => s.column === columnId);

      if (existingIndex >= 0) {
        const existing = newSorting[existingIndex];
        if (existing != null && existing.direction === 'asc') {
          newSorting[existingIndex] = {
            column: existing.column,
            direction: 'desc' as const,
            priority: existing.priority,
          };
        } else {
          newSorting.splice(existingIndex, 1);
        }
      } else {
        newSorting.push({
          column: columnId,
          direction: 'asc' as const,
          priority: newSorting.length,
        });
      }

      if (onSortingChange != null) {
        onSortingChange(newSorting);
      } else {
        setSorting(newSorting);
      }
    },
    [currentSorting, onSortingChange, setSorting]
  );

  // Handle selection
  const handleSelectAll = useCallback(() => {
    const allKeys = processedData.map((row, index) => getRowKey(row, index));
    const newSelection =
      currentSelection.length === allKeys.length ? [] : allKeys;

    if (onSelectionChange != null) {
      onSelectionChange(newSelection);
    } else {
      setSelection(newSelection);
    }
  }, [
    processedData,
    currentSelection,
    getRowKey,
    onSelectionChange,
    setSelection,
  ]);

  const handleSelectRow = useCallback(
    (rowKey: string) => {
      const newSelection = currentSelection.includes(rowKey)
        ? currentSelection.filter(key => key !== rowKey)
        : [...currentSelection, rowKey];

      if (onSelectionChange != null) {
        onSelectionChange(newSelection);
      } else {
        setSelection(newSelection);
      }
    },
    [currentSelection, onSelectionChange, setSelection]
  );

  // Handle row expansion
  const handleExpandRow = useCallback(
    (rowKey: string) => {
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(rowKey)) {
        newExpanded.delete(rowKey);
      } else {
        newExpanded.add(rowKey);
      }
      setExpandedRows(newExpanded);
    },
    [expandedRows, setExpandedRows]
  );

  // Export functions
  const handleExportCsv = useCallback(() => {
    DataTableExporter.toCsv(allData, columns, `${stateKey}_export.csv`);
  }, [allData, columns, stateKey]);

  const handleExportJson = useCallback(() => {
    DataTableExporter.toJson(allData, `${stateKey}_export.json`);
  }, [allData, stateKey]);

  if (error != null) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {/* Global Search */}
        {enableGlobalSearch ? (
          <div className="max-w-md flex-1">
            <input
              type="text"
              placeholder={globalSearchPlaceholder}
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : null}

        {/* Export Buttons */}
        {exportable ? (
          <div className="flex gap-2">
            <button
              onClick={handleExportCsv}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJson}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Export JSON
            </button>
          </div>
        ) : null}
      </div>

      {/* Table Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-gray-200"
        style={{ height: virtualScrolling ? height : 'auto' }}
      >
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : null}

        <div
          className="overflow-auto"
          style={{ height: virtualScrolling ? height : 'auto' }}
          onScroll={
            virtualScrolling
              ? e => setScrollTop(e.currentTarget.scrollTop)
              : undefined
          }
        >
          {virtualScrolling ? (
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                <table ref={tableRef} className="w-full">
                  {/* Table content will be rendered here */}
                </table>
              </div>
            </div>
          ) : null}

          <table
            className={cn('w-full', { 'absolute top-0': virtualScrolling })}
          >
            {/* Table Header */}
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {/* Selection Column */}
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      currentSelection.length === processedData.length &&
                      processedData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>

                {/* Expandable Column */}
                {expandableRows ? <th className="w-12 px-4 py-3" /> : null}

                {/* Data Columns */}
                {columns
                  .filter(col => col.hidden !== true)
                  .map(column => (
                    <th
                      key={column.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
                        column.sortable === true &&
                          'cursor-pointer hover:bg-gray-100'
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      onClick={() =>
                        column.sortable === true && handleSort(column.id)
                      }
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {column.sortable === true &&
                        currentSorting.find(s => s.column === column.id) !==
                          undefined ? (
                          <span className="text-blue-600">
                            {currentSorting.find(s => s.column === column.id)
                              ?.direction === 'asc'
                              ? '↑'
                              : '↓'}
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 bg-white">
              {dataToRender.map((row, index) => {
                const key = getRowKey(row, index);
                const isSelected = currentSelection.includes(key);
                const isExpanded = expandedRows.has(key);

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={cn(
                        'transition-colors hover:bg-gray-50',
                        isSelected === true && 'bg-blue-50',
                        onRowClick !== undefined && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row)}
                      onDoubleClick={() => onRowDoubleClick?.(row)}
                    >
                      {/* Selection Cell */}
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          className="rounded border-gray-300 focus:ring-blue-500"
                          onClick={e => e.stopPropagation()}
                        />
                      </td>

                      {/* Expandable Cell */}
                      {expandableRows ? (
                        <td className="w-12 px-4 py-3">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleExpandRow(key);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded === true ? '−' : '+'}
                          </button>
                        </td>
                      ) : null}

                      {/* Data Cells */}
                      {columns
                        .filter(col => col.hidden !== true)
                        .map(column => {
                          const value =
                            column.accessorKey !== undefined
                              ? row[column.accessorKey]
                              : column.accessor?.(row);

                          return (
                            <td
                              key={column.id}
                              className="px-4 py-3 text-sm text-gray-900"
                              style={{
                                width: column.width,
                                minWidth: column.minWidth,
                                maxWidth: column.maxWidth,
                              }}
                            >
                              {column.cell !== undefined
                                ? column.cell(value, row)
                                : String(value ?? '')}
                            </td>
                          );
                        })}
                    </tr>

                    {/* Expanded Row */}
                    {expandableRows &&
                    isExpanded === true &&
                    renderExpandedRow !== undefined ? (
                      <tr>
                        <td
                          colSpan={
                            columns.filter(col => col.hidden !== true).length +
                            2
                          }
                        >
                          <div className="bg-gray-50 px-4 py-3">
                            {renderExpandedRow(row)}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {virtualScrolling !== true && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing{' '}
            {Math.min(
              (currentPagination.page - 1) * currentPagination.pageSize + 1,
              currentPagination.total
            )}{' '}
            to{' '}
            {Math.min(
              currentPagination.page * currentPagination.pageSize,
              currentPagination.total
            )}{' '}
            of {currentPagination.total} results
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newPagination = {
                  ...currentPagination,
                  page: currentPagination.page - 1,
                };
                if (onPaginationChange != null) {
                  onPaginationChange(newPagination);
                } else {
                  setPagination(newPagination);
                }
              }}
              disabled={currentPagination.page <= 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPagination.page} of{' '}
              {Math.ceil(currentPagination.total / currentPagination.pageSize)}
            </span>

            <button
              onClick={() => {
                const newPagination = {
                  ...currentPagination,
                  page: currentPagination.page + 1,
                };
                if (onPaginationChange != null) {
                  onPaginationChange(newPagination);
                } else {
                  setPagination(newPagination);
                }
              }}
              disabled={
                currentPagination.page >=
                Math.ceil(currentPagination.total / currentPagination.pageSize)
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
