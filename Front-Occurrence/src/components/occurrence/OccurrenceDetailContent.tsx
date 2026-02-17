import { OccurrenceHeader } from './OccurrenceHeader';
import { OccurrenceInfo } from './OccurrenceInfo';
import { OccurrenceActions } from './OccurrenceActions';
import { DispatchHistorySection } from './DispatchHistorySection';
import type { OccurrenceDetail } from '../../types';

interface OccurrenceDetailContentProps {
  occurrence: OccurrenceDetail;
  canStart: boolean;
  canResolve: boolean;
  canCancel: boolean;
  canCreateDispatch: boolean;
  onBack: () => void;
  onStart: () => void;
  onResolve: () => void;
  onCancel: () => void;
  onCreateDispatch: () => void;
  onUpdateDispatchStatus: (dispatchId: string, statusCode: string) => void;
  isStarting: boolean;
  isResolving: boolean;
  isCancelling: boolean;
  isUpdatingDispatch: boolean;
  updatingDispatchId: string | null;
  processingCommandIds: Set<string>;
  processingMessage: string | null;
  processingError: string | null;
  startError: Error | null;
  resolveError: Error | null;
  cancelError: Error | null;
}

export const OccurrenceDetailContent = ({
  occurrence,
  canStart,
  canResolve,
  canCancel,
  canCreateDispatch,
  onBack,
  onStart,
  onResolve,
  onCancel,
  onCreateDispatch,
  onUpdateDispatchStatus,
  isStarting,
  isResolving,
  isCancelling,
  isUpdatingDispatch,
  updatingDispatchId,
  processingCommandIds,
  processingMessage,
  processingError,
  startError,
  resolveError,
  cancelError,
}: OccurrenceDetailContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <OccurrenceHeader occurrence={occurrence} onBack={onBack} />

      <OccurrenceInfo occurrence={occurrence} />

      <OccurrenceActions
        canStart={canStart}
        canResolve={canResolve}
        canCancel={canCancel}
        canCreateDispatch={canCreateDispatch}
        onStart={onStart}
        onResolve={onResolve}
        onCancel={onCancel}
        onCreateDispatch={onCreateDispatch}
        isStarting={isStarting}
        isResolving={isResolving}
        isCancelling={isCancelling}
        processingMessage={processingMessage}
        processingError={processingError}
        startError={startError}
        resolveError={resolveError}
        cancelError={cancelError}
      />

      <DispatchHistorySection
        occurrence={occurrence}
        updatingDispatchId={updatingDispatchId}
        isUpdating={isUpdatingDispatch}
        processingCommandIds={processingCommandIds}
        onUpdateStatus={onUpdateDispatchStatus}
      />
    </div>
  );
};

