/**
 * Componente de lista de despachos
 */

import { DispatchItem } from './DispatchItem';
import type { Dispatch } from '../../types';

interface DispatchListProps {
  dispatches: Dispatch[];
  updatingDispatchId: string | null;
  isUpdating: boolean;
  onUpdateStatus: (dispatchId: string, statusCode: string) => void;
  getNextStatuses: (currentStatus: string) => string[];
}

export const DispatchList = ({
  dispatches,
  updatingDispatchId,
  isUpdating,
  onUpdateStatus,
  getNextStatuses,
}: DispatchListProps) => {
  if (dispatches.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">Nenhum despacho registrado ainda</p>
    );
  }

  return (
    <div className="space-y-4">
      {dispatches.map((dispatch) => {
        const nextStatuses = getNextStatuses(dispatch.status_code);
        const isUpdatingThis = updatingDispatchId === dispatch.id && isUpdating;

        return (
          <DispatchItem
            key={dispatch.id}
            dispatch={dispatch}
            nextStatuses={nextStatuses}
            isUpdating={isUpdatingThis}
            onUpdateStatus={onUpdateStatus}
          />
        );
      })}
    </div>
  );
};

