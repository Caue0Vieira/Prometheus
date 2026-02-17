/**
 * Componente de paginação da lista de ocorrências
 */

import { Button } from '../common';

interface OccurrencesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  currentItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const OccurrencesPagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  currentItems,
  onPageChange,
  onPageSizeChange,
  onPrevious,
  onNext,
}: OccurrencesPaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(start + currentItems - 1, totalItems);
  const firstPage = Math.max(1, currentPage - 2);
  const lastPage = Math.min(safeTotalPages, currentPage + 2);
  const visiblePages: number[] = [];
  for (let p = firstPage; p <= lastPage; p += 1) {
    visiblePages.push(p);
  }

  return (
    <div className="bg-gray-50 px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{start}</span> -{' '}
        <span className="font-medium">{end}</span> de{' '}
        <span className="font-medium">{totalItems}</span> ocorrências
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-700">Itens por página:</label>
        <select
          className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <Button variant="secondary" size="sm" onClick={onPrevious} disabled={currentPage === 1}>
          {'<-'} Anterior
        </Button>
        {firstPage > 1 && (
          <>
            <Button variant="secondary" size="sm" onClick={() => onPageChange(1)}>
              1
            </Button>
            {firstPage > 2 && <span className="px-1 text-sm text-gray-500">...</span>}
          </>
        )}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        {lastPage < safeTotalPages && (
          <>
            {lastPage < safeTotalPages - 1 && <span className="px-1 text-sm text-gray-500">...</span>}
            <Button variant="secondary" size="sm" onClick={() => onPageChange(safeTotalPages)}>
              {safeTotalPages}
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onNext}
          disabled={currentPage === safeTotalPages}
        >
          Próxima {'->'}
        </Button>
      </div>
    </div>
  );
};

