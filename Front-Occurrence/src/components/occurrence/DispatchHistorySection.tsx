import { DispatchList } from './DispatchList';
import type { OccurrenceDetail } from '../../types';

interface DispatchHistorySectionProps {
  occurrence: OccurrenceDetail;
  updatingDispatchId: string | null;
  isUpdating: boolean;
  processingCommandId: string | null;
  onUpdateStatus: (dispatchId: string, statusCode: string) => void;
}

const getNextStatuses = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    assigned: ['en_route'],
    en_route: ['on_site'],
    on_site: ['closed'],
    closed: [],
  };
  return transitions[currentStatus] || [];
};

export const DispatchHistorySection = ({
  occurrence,
  updatingDispatchId,
  isUpdating,
  processingCommandId,
  onUpdateStatus,
}: DispatchHistorySectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Despachos</h2>
      <DispatchList
        dispatches={occurrence.dispatches}
        updatingDispatchId={updatingDispatchId}
        isUpdating={isUpdating}
        onUpdateStatus={onUpdateStatus}
        getNextStatuses={getNextStatuses}
        processingCommandId={processingCommandId}
      />
    </div>
  );
};

