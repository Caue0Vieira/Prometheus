/**
 * Componente de tabela de ocorrências
 */

import { Button, StatusBadge } from '../common';
import { formatDateOnly, formatOccurrenceType } from '../../utils/formatters';
import type { Occurrence } from '../../types';
import { OccurrencesPagination } from './OccurrencesPagination';

interface OccurrencesTableProps {
  occurrences: Occurrence[];
  onOccurrenceClick: (id: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onPrevious: () => void;
    onNext: () => void;
  };
}

export const OccurrencesTable = ({
  occurrences,
  onOccurrenceClick,
  pagination,
}: OccurrencesTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {occurrences.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma ocorrência encontrada
                </td>
              </tr>
            ) : (
              occurrences.map((occurrence) => (
                <tr
                  key={occurrence.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onOccurrenceClick(occurrence.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {occurrence.id.substring(0, 8)}...
                    </div>
                    {occurrence.external_id && (
                      <div className="text-sm text-gray-500">{occurrence.external_id}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatOccurrenceType(occurrence.type_code, occurrence.type_name)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={occurrence.status_code} statusName={occurrence.status_name} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateOnly(occurrence.reported_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOccurrenceClick(occurrence.id);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <OccurrencesPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          currentItems={occurrences.length}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
        />
      )}
    </div>
  );
};

