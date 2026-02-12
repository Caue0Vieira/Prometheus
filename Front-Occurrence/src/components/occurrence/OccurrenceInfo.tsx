/**
 * Componente de informações principais da ocorrência
 */

import { StatusBadge } from '../common';
import { formatDate, formatOccurrenceType } from '../../utils/formatters';
import type { OccurrenceDetail } from '../../types';

interface OccurrenceInfoProps {
  occurrence: OccurrenceDetail;
}

export const OccurrenceInfo = ({ occurrence }: OccurrenceInfoProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Informações da Ocorrência
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Tipo</label>
          <p className="mt-1 text-sm text-gray-900">
            {formatOccurrenceType(occurrence.type_code, occurrence.type_name)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <p className="mt-1">
            <StatusBadge status={occurrence.status_code} statusName={occurrence.status_name} />
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Data de Relato</label>
          <p className="mt-1 text-sm text-gray-900">{formatDate(occurrence.reported_at)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Última Atualização</label>
          <p className="mt-1 text-sm text-gray-900">{formatDate(occurrence.updated_at)}</p>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-500">Descrição</label>
        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{occurrence.description}</p>
      </div>
    </div>
  );
};

