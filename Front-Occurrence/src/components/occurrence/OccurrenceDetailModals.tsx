import { CreateDispatchModal } from './CreateDispatchModal';
import { ConfirmModal } from '../common';

interface OccurrenceDetailModalsProps {
  showDispatchModal: boolean;
  showConfirmResolveModal: boolean;
  showConfirmCancelModal: boolean;
  onCreateDispatchClose: () => void;
  onCreateDispatchSubmit: (resourceCode: string) => Promise<void>;
  onConfirmResolveClose: () => void;
  onConfirmResolve: () => void;
  onConfirmCancelClose: () => void;
  onConfirmCancel: () => void;
  isCreatingDispatch: boolean;
  isResolving: boolean;
  isCancelling: boolean;
  processingDispatchCount?: number;
  commandStatuses?: Map<string, string>;
}

export const OccurrenceDetailModals = ({
  showDispatchModal,
  showConfirmResolveModal,
  showConfirmCancelModal,
  onCreateDispatchClose,
  onCreateDispatchSubmit,
  onConfirmResolveClose,
  onConfirmResolve,
  onConfirmCancelClose,
  onConfirmCancel,
  isCreatingDispatch,
  isResolving,
  isCancelling,
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

      <ConfirmModal
        isOpen={showConfirmCancelModal}
        onClose={onConfirmCancelClose}
        onConfirm={onConfirmCancel}
        title="Cancelar Ocorrência"
        message="Tem certeza que deseja cancelar esta ocorrência? Esta ação não pode ser desfeita."
        confirmText="Cancelar Ocorrência"
        cancelText="Voltar"
        confirmVariant="warning"
        isLoading={isCancelling}
      />
    </>
  );
};

