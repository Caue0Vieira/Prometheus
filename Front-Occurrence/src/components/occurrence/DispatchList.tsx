/**
 * Componente de lista de despachos
 */

import { DispatchItem } from './DispatchItem';
import type { Dispatch } from '../../types';

export interface DispatchListProps {
  dispatches: Dispatch[];
  updatingDispatchId: string | null;
  isUpdating: boolean;
  onUpdateStatus: (dispatchId: string, statusCode: string) => void;
  getNextStatuses: (currentStatus: string) => string[];
  processingCommandId?: string | null;
}

export const DispatchList = ({
  dispatches,
  updatingDispatchId,
  isUpdating,
  onUpdateStatus,
  getNextStatuses,
  processingCommandId,
}: DispatchListProps) => {
  if (dispatches.length === 0 && !processingCommandId) {
    return (
      <p className="text-gray-500 text-center py-8">Nenhum despacho registrado ainda</p>
    );
  }

  if (dispatches.length === 0 && processingCommandId) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <svg
            className="animate-spin h-5 w-5"
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
          <span className="text-sm font-medium">Processando despacho...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dispatches.map((dispatch, index) => {
        const nextStatuses = getNextStatuses(dispatch.status_code);
        const isUpdatingThis = updatingDispatchId === dispatch.id && isUpdating;
        const isProcessing = Boolean(processingCommandId && index === dispatches.length - 1);

        return (
          <DispatchItem
            key={dispatch.id}
            dispatch={dispatch}
            nextStatuses={nextStatuses}
            isUpdating={isUpdatingThis}
            onUpdateStatus={onUpdateStatus}
            isProcessing={isProcessing}
          />
        );
      })}
    </div>
  );
};

