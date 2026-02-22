import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import useNotification from '@/src/hooks/notification/useNotification';
import useDebounce from '@/src/hooks/useDebounce';

type FetchFn<T> = (
  page: number,
  limit: number,
  search: string,
) => Promise<{ data: T[]; meta: { totalItems: number } }>;

export default function useTableData<T>(queryKey: string, fetchFn: FetchFn<T>) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [items, setItems] = React.useState<T[]>([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { showNotification } = useNotification();

  async function fetchData(
    _page: number,
    _limit: number,
    _search: string,
  ): Promise<T[]> {
    try {
      const response = await fetchFn(_page, _limit, _search);
      setItems(response.data);
      setTotalItems(response.meta.totalItems);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification({ message: err.message, level: 'error' });
      } else {
        showNotification({
          message: 'An unknown error occurred',
          level: 'error',
        });
      }
    }
    return [];
  }

  const queryResult = useQuery({
    queryKey: [queryKey, page, rowsPerPage, debouncedSearchTerm],
    queryFn: () => fetchData(page, rowsPerPage, debouncedSearchTerm),
    placeholderData: [],
  });

  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setPage(0);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const handleChangePage = async (_: unknown, newPage: number) => {
    setPage(newPage);
    await fetchData(newPage, rowsPerPage, debouncedSearchTerm);
  };

  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    await fetchData(0, +event.target.value, debouncedSearchTerm);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const refetch = () => fetchData(page, rowsPerPage, debouncedSearchTerm);

  return {
    items,
    totalItems,
    isPending: queryResult.isPending,
    page,
    rowsPerPage,
    searchTerm,
    refetch,
    handlers: {
      onPageChange: handleChangePage,
      onRowsPerPageChange: handleChangeRowsPerPage,
      onSearchChange: handleSearchChange,
    },
  };
}
