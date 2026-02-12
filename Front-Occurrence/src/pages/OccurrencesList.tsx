/**
 * Página de Lista de Ocorrências
 * Exibe tabela com filtros e paginação
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrences } from '../hooks';
import { LoadingSpinner, ErrorAlert, Button } from '../components/common';
import { OccurrencesFilters, OccurrencesTable } from '../components/occurrences';

export const OccurrencesList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useOccurrences({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    page,
    limit: 20,
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    refetch();
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
    refetch();
  };

  const handleOccurrenceClick = (id: string) => {
    navigate(`/occurrences/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert message={error.message || 'Erro ao carregar ocorrências'} />
        <div className="mt-4">
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  const occurrences = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ocorrências</h1>
        <p className="text-gray-600">Gerencie e acompanhe todas as ocorrências do sistema</p>
      </div>

      <OccurrencesFilters
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
        onClear={handleClearFilters}
      />

      {meta && (
        <OccurrencesTable
          occurrences={occurrences}
          onOccurrenceClick={handleOccurrenceClick}
          pagination={{
            currentPage: meta.page,
            totalPages: meta.pages,
            totalItems: meta.total,
            onPrevious: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(meta.pages, p + 1)),
          }}
        />
      )}
    </div>
  );
};
