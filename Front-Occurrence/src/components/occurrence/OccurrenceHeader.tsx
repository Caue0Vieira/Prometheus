/**
 * Header da página de detalhe da ocorrência
 */

import { Button, StatusBadge } from '../common';
import type { OccurrenceDetail } from '../../types';

interface OccurrenceHeaderProps {
  occurrence: OccurrenceDetail;
  onBack: () => void;
}

export const OccurrenceHeader = ({ occurrence, onBack }: OccurrenceHeaderProps) => {
  return (
    <div className="mb-6">
      <Button variant="secondary" onClick={onBack} className="mb-4">
        ← Voltar para Lista
      </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ocorrência #{occurrence.id.substring(0, 8)}
          </h1>
          {occurrence.external_id && (
            <p className="text-gray-600">ID Externo: {occurrence.external_id}</p>
          )}
        </div>
        <StatusBadge status={occurrence.status_code} statusName={occurrence.status_name} size="lg" />
      </div>
    </div>
  );
};

