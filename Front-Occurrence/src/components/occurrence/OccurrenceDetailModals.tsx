import { CreateDispatchModal } from './CreateDispatchModal';
import { ConfirmModal } from '../common';

interface OccurrenceDetailModalsProps {
  showDispatchModal: boolean;
  showConfirmResolveModal: boolean;
  onCreateDispatchClose: () => void;
  onCreateDispatchSubmit: (resourceCode: string) => Promise<void>;
  onConfirmResolveClose: () => void;
  onConfirmResolve: () => void;
  isCreatingDispatch: boolean;
  isResolving: boolean;
  processingDispatchCount?: number;
  commandStatuses?: Map<string, string>;
}

export const OccurrenceDetailModals = ({
  showDispatchModal,
  showConfirmResolveModal,
  onCreateDispatchClose,
  onCreateDispatchSubmit,
  onConfirmResolveClose,
  onConfirmResolve,
  isCreatingDispatch,
  isResolving,
  processingDispatchCount = 0,
  commandStatuses = new Map(),
}: OccurrenceDetailModalsProps) => {
  return (
    <>
      <CreateDispatchModal
        isOpen={showDispatchModal}
        onClose={onCreateDispatchClose}
        onSubmit={onCreateDispatchSubmit}
        isLoading={isCreatingDispatch}
        processingCount={processingDispatchCount}
        commandStatuses={commandStatuses}
      />

      <ConfirmModal
        isOpen={showConfirmResolveModal}
        onClose={onConfirmResolveClose}
        onConfirm={onConfirmResolve}
        title="Encerrar Ocorrência"
        message="Tem certeza que deseja encerrar esta ocorrência?"
        confirmText="Encerrar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={isResolving}
      />
    </>
  );
};

