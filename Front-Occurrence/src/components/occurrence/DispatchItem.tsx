/**
 * Componente de item individual de despacho
 */

import { Button, StatusBadge } from '../common';
import { formatDate } from '../../utils/formatters';
import type { Dispatch } from '../../types';

export interface DispatchItemProps {
  dispatch: Dispatch;
  nextStatuses: string[];
  isUpdating: boolean;
  onUpdateStatus: (dispatchId: string, statusCode: string) => void;
  isProcessing?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  en_route: 'A Caminho',
  on_site: 'No Local',
  closed: 'Encerrar',
};

export const DispatchItem = ({
  dispatch,
  nextStatuses,
  isUpdating,
  onUpdateStatus,
  isProcessing = false,
}: DispatchItemProps) => {
  const canUpdate = nextStatuses.length > 0 && dispatch.status_code !== 'closed';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-gray-900">{dispatch.resource_code}</span>
            <div className="flex items-center gap-2">
              {isProcessing ? (
                <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                <StatusBadge status={dispatch.status_code} statusName={dispatch.status_name} />
              )}
              {isUpdating && !isProcessing && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg
                    className="animate-spin h-3 w-3 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processando...
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">Criado em {formatDate(dispatch.created_at)}</p>
        </div>
        {canUpdate && (
          <div className="flex gap-2 ml-4">
            {nextStatuses.map((nextStatus) => (
              <Button
                key={nextStatus}
                variant="secondary"
                size="sm"
                onClick={() => onUpdateStatus(dispatch.id, nextStatus)}
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                {STATUS_LABELS[nextStatus] || nextStatus}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

