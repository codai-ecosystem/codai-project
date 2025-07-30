'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';

export interface DataTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  enableSorting?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  title?: string;
}

interface SortingState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  className,
  title = 'Data Table',
}: DataTableProps<T>): JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [sorting, setSorting] = React.useState<SortingState>({
    column: null,
    direction: null,
  });

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item => {
      return columns.some(column => {
        if (column.accessorKey !== undefined) {
          const value = item[column.accessorKey];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (sorting.column === null || sorting.direction === null)
      return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sorting.column as keyof T];
      const bValue = b[sorting.column as keyof T];

      if (aValue === bValue) return 0;

      const isAscending = sorting.direction === 'asc';

      if (aValue === null || aValue === undefined) return isAscending ? 1 : -1;
      if (bValue === null || bValue === undefined) return isAscending ? -1 : 1;

      if (aValue < bValue) return isAscending ? -1 : 1;
      if (aValue > bValue) return isAscending ? 1 : -1;

      return 0;
    });
  }, [filteredData, sorting]);

  const handleSort = React.useCallback((columnKey: keyof T): void => {
    setSorting(prev => {
      if (prev.column !== String(columnKey)) {
        return { column: String(columnKey), direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column: String(columnKey), direction: 'desc' };
      }
      return { column: null, direction: null };
    });
  }, []);

  const getSortIcon = React.useCallback(
    (columnKey: keyof T): React.ReactNode => {
      if (sorting.column !== String(columnKey)) {
        return <ArrowUpDown className="h-4 w-4" />;
      }
      return sorting.direction === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    },
    [sorting]
  );

  const handleClearSearch = React.useCallback((): void => {
    setSearchTerm('');
  }, []);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchTerm(e.target.value);
    },
    []
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {searchable && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-8 sm:w-[250px]"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-2.5"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={cn(
                        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
                        column.className
                      )}
                    >
                      {column.enableSorting !== false &&
                        column.accessorKey !== undefined ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 data-[state=open]:bg-accent"
                          onClick={() =>
                            handleSort(column.accessorKey as keyof T)
                          }
                        >
                          <span>{column.header}</span>
                          <div className="ml-2 h-4 w-4 shrink-0">
                            {getSortIcon(column.accessorKey as keyof T)}
                          </div>
                        </Button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="h-24 text-center">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={cn(
                            'p-4 align-middle [&:has([role=checkbox])]:pr-0',
                            column.className
                          )}
                        >
                          {column.cell !== undefined
                            ? column.cell(item)
                            : column.accessorKey !== undefined
                              ? String(item[column.accessorKey] ?? '')
                              : ''}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
