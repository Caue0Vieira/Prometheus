/**
 * Componente de paginação da lista de ocorrências
 */

import { Button } from '../common';

interface OccurrencesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentItems: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const OccurrencesPagination = ({
  currentPage,
  totalPages,
  totalItems,
  currentItems,
  onPrevious,
  onNext,
}: OccurrencesPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{currentItems}</span> de{' '}
        <span className="font-medium">{totalItems}</span> ocorrências
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onPrevious} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};

