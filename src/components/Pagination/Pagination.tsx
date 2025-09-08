'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination as MantinePagination } from '@mantine/core';

type PaginationProps = {
  totalPages: number;
};

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <MantinePagination
      total={totalPages}
      value={currentPage}
      onChange={handlePageChange}
      mt="md"
      style={{ display: 'flex', justifyContent: 'center' }}
    />
  );
}
