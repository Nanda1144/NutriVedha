import { useMemo } from 'react';

// Replaces repeated `const filtered = rows.filter(...)` with q + status/role filters in ~12 pages
export function useFilteredList<T>(
  rows: T[],
  opts: {
    search: string;
    searchKeys: (keyof T)[];
    filterFn?: (row: T) => boolean;
  }
) {
  const { search, searchKeys, filterFn } = opts;
  return useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(row => {
      const matchesSearch = !q || searchKeys.some(k => String((row as any)[k] ?? '').toLowerCase().includes(q));
      const matchesFilter = filterFn ? filterFn(row) : true;
      return matchesSearch && matchesFilter;
    });
  }, [rows, search, searchKeys, filterFn]);
}
