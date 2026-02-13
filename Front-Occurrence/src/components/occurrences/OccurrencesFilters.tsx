/**
 * Componente de filtros da lista de ocorrências
 */

import { Button, Select, LoadingSpinner } from '../common';
import { useOccurrenceTypes, useOccurrenceStatuses } from '../../hooks';

interface OccurrencesFiltersProps {
  statusFilter: string;
  typeFilter: string;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClear: () => void;
}

export const OccurrencesFilters = ({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
  onClear,
}: OccurrencesFiltersProps) => {
  const { data: typesData, isLoading: isLoadingTypes } = useOccurrenceTypes();
  const { data: statusesData, isLoading: isLoadingStatuses } = useOccurrenceStatuses();

  const STATUS_OPTIONS = [
    { value: '', label: 'Todos os status' },
    ...(statusesData?.data.map((status) => ({
      value: status.code,
      label: status.name,
    })) || []),
  ];

  // Monta as opções de tipos a partir da API
  const TYPE_OPTIONS = [
    { value: '', label: 'Todos os tipos' },
    ...(typesData?.data.map((type) => ({
      value: type.code,
      label: type.name,
    })) || []),
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingStatuses ? (
          <div className="flex items-center justify-center h-10">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          />
        )}

        {isLoadingTypes ? (
          <div className="flex items-center justify-center h-10">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <Select
            label="Tipo"
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
          />
        )}

        <div className="flex items-end">
          <Button variant="secondary" onClick={onClear}>
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

