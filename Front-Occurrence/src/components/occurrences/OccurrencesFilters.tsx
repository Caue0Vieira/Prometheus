/**
 * Componente de filtros da lista de ocorrências
 */

import { Button, Select } from '../common';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'reported', label: 'Reportada' },
  { value: 'in_progress', label: 'Em Atendimento' },
  { value: 'resolved', label: 'Resolvida' },
  { value: 'cancelled', label: 'Cancelada' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'incendio_urbano', label: 'Incêndio Urbano' },
  { value: 'incendio_florestal', label: 'Incêndio Florestal' },
  { value: 'resgate_veicular', label: 'Resgate Veicular' },
  { value: 'atendimento_pre_hospitalar', label: 'Atendimento Pré-Hospitalar' },
  { value: 'salvamento_aquatico', label: 'Salvamento Aquático' },
  { value: 'falso_chamado', label: 'Falso Chamado' },
  { value: 'vazamento_gas', label: 'Vazamento de Gás' },
  { value: 'queda_arvore', label: 'Queda de Árvore' },
];

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
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        />

        <Select
          label="Tipo"
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        />

        <div className="flex items-end">
          <Button variant="secondary" onClick={onClear}>
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

