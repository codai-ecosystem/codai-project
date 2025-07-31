'use client';

import { useCallback, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc' | undefined;

export interface SortState<T> {
  column: keyof T | undefined;
  direction: SortDirection;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface TableFilterValue {
  id: string;
  value: string | number | boolean | null;
}

export interface UseTableDataParams<T> {
  data: T[];
  initialSort?: SortState<T>;
  initialPagination?: PaginationState;
  initialFilters?: TableFilterValue[];
}

export interface UseTableDataReturn<T> {
  processedData: T[];
  totalItems: number;
  pageCount: number;
  sorting: SortState<T>;
  setSorting: (column: keyof T | undefined, direction?: SortDirection) => void;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  filters: TableFilterValue[];
  setFilter: (id: string, value: string | number | boolean | null) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  selectedItems: T[];
  selectedIds: (string | number)[];
  toggleItemSelection: (item: T, idField?: keyof T) => void;
  selectAll: (select?: boolean) => void;
  isAllSelected: boolean;
  isItemSelected: (item: T, idField?: keyof T) => boolean;
  setSelectedItems: (items: T[]) => void;
}

export function useTableData<
  T extends Record<string, unknown> & { id: string | number },
>({
  data,
  initialSort,
  initialPagination = { pageIndex: 0, pageSize: 10 },
  initialFilters = [],
}: UseTableDataParams<T>): UseTableDataReturn<T> {
  const [sorting, setSortingState] = useState<SortState<T>>({
    column: initialSort?.column,
    direction: initialSort?.direction,
  });

  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);
  const [filters, setFilters] = useState<TableFilterValue[]>(initialFilters);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Apply sorting
  const setSorting = useCallback(
    (column: keyof T | undefined, direction?: SortDirection) => {
      setSortingState({
        column,
        direction:
          direction ??
          (sorting.column === column && sorting.direction === 'asc'
            ? 'desc'
            : 'asc'),
      });
    },
    [sorting]
  );

  // Apply filters
  const setFilter = useCallback(
    (id: string, value: string | number | boolean | null) => {
      setFilters(prev => {
        const exists = prev.find(filter => filter.id === id);
        if (exists != null) {
          return prev.map(filter =>
            filter.id === id ? { id, value } : filter
          );
        }
        return [...prev, { id, value }];
      });
      // Reset to first page when filtering
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const removeFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Selection logic
  const toggleItemSelection = useCallback(
    (item: T, idField: keyof T = 'id') => {
      const itemId = item[idField];
      setSelectedItems(prev => {
        const exists = prev.some(i => i[idField] === itemId);
        if (exists) {
          return prev.filter(i => i[idField] !== itemId);
        }
        return [...prev, item];
      });
    },
    []
  );

  const isItemSelected = useCallback(
    (item: T, idField: keyof T = 'id') => {
      return selectedItems.some(i => i[idField] === item[idField]);
    },
    [selectedItems]
  );

  // Process data with filters, sorting, and pagination
  const filteredData = useMemo(() => {
    // First apply filters
    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.id];
        if (filter.value === null) return value === null || value === undefined;
        if (filter.value === '') return true; // Empty string means no filter

        if (typeof filter.value === 'string' && typeof value === 'string') {
          return value.toLowerCase().includes(filter.value.toLowerCase());
        }

        return value === filter.value;
      });
    });
  }, [data, filters]);

  const selectAll = useCallback(
    (select = true) => {
      if (select) {
        setSelectedItems(filteredData);
      } else {
        setSelectedItems([]);
      }
    },
    [filteredData, setSelectedItems]
  );

  const sortedData = useMemo(() => {
    if (sorting.column === undefined || sorting.direction === undefined)
      return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sorting.column as keyof T];
      const bValue = b[sorting.column as keyof T];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // For strings, use localeCompare
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sorting.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For numbers, booleans, and dates
      return sorting.direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue > bValue
          ? -1
          : 1;
    });
  }, [filteredData, sorting]);

  const processedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  const totalItems = filteredData.length;
  const pageCount = Math.ceil(totalItems / pagination.pageSize);

  const isAllSelected = useMemo(() => {
    return (
      filteredData.length > 0 && selectedItems.length === filteredData.length
    );
  }, [filteredData, selectedItems]);

  const selectedIds = useMemo(() => {
    return selectedItems.map(item => item.id);
  }, [selectedItems]);

  return {
    processedData,
    totalItems,
    pageCount,
    sorting,
    setSorting,
    pagination,
    setPagination,
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    selectedItems,
    selectedIds,
    toggleItemSelection,
    selectAll,
    isAllSelected,
    isItemSelected,
    setSelectedItems,
  };
}
