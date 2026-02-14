import { OccurrenceHeader } from './OccurrenceHeader';
import { OccurrenceInfo } from './OccurrenceInfo';
import { OccurrenceActions } from './OccurrenceActions';
import { DispatchHistorySection } from './DispatchHistorySection';
import type { OccurrenceDetail } from '../../types';

interface OccurrenceDetailContentProps {
  occurrence: OccurrenceDetail;
  canStart: boolean;
  canResolve: boolean;
  canCreateDispatch: boolean;
  onBack: () => void;
  onStart: () => void;
  onResolve: () => void;
  onCreateDispatch: () => void;
  onUpdateDispatchStatus: (dispatchId: string, statusCode: string) => void;
  isStarting: boolean;
  isResolving: boolean;
  isUpdatingDispatch: boolean;
  updatingDispatchId: string | null;
  processingCommandId: string | null;
  processingMessage: string | null;
  processingError: string | null;
  startError: Error | null;
  resolveError: Error | null;
}

export const OccurrenceDetailContent = ({
  occurrence,
  canStart,
  canResolve,
  canCreateDispatch,
  onBack,
  onStart,
  onResolve,
  onCreateDispatch,
  onUpdateDispatchStatus,
  isStarting,
  isResolving,
  isUpdatingDispatch,
  updatingDispatchId,
  processingCommandId,
  processingMessage,
  processingError,
  startError,
  resolveError,
}: OccurrenceDetailContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <OccurrenceHeader occurrence={occurrence} onBack={onBack} />

      <OccurrenceInfo occurrence={occurrence} />

      <OccurrenceActions
        canStart={canStart}
        canResolve={canResolve}
        canCreateDispatch={canCreateDispatch}
        onStart={onStart}
        onResolve={onResolve}
        onCreateDispatch={onCreateDispatch}
        isStarting={isStarting}
        isResolving={isResolving}
        processingMessage={processingMessage}
        processingError={processingError}
        startError={startError}
        resolveError={resolveError}
      />

      <DispatchHistorySection
        occurrence={occurrence}
        updatingDispatchId={updatingDispatchId}
        isUpdating={isUpdatingDispatch}
        processingCommandId={processingCommandId}
        onUpdateStatus={onUpdateDispatchStatus}
      />
    </div>
  );
};

