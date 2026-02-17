/**
 * Página de Detalhe da Ocorrência
 * Exibe informações completas, histórico de dispatches e ações
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useOccurrenceDetailPage } from '../hooks';
import { LoadingSpinner, ErrorAlert, Button } from '../components/common';
import {
  OccurrenceDetailContent,
  OccurrenceDetailModals,
} from '../components/occurrence';

export const OccurrenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    occurrence,
    isLoading,
    error,
    showDispatchModal,
    setShowDispatchModal,
    showConfirmResolveModal,
    setShowConfirmResolveModal,
    showConfirmCancelModal,
    setShowConfirmCancelModal,
    processingMessage,
    processingError,
    updatingDispatchId,
    processingDispatchCommandIds,
    commandStatuses,
    canStart,
    canResolve,
    canCancel,
    canCreateDispatch,
    startMutation,
    resolveMutation,
    cancelMutation,
    createDispatchMutation,
    updateDispatchStatusMutation,
    handleStart,
    handleResolve,
    handleCancel,
    handleCreateDispatch,
    handleUpdateDispatchStatus,
  } = useOccurrenceDetailPage(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !occurrence) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert message={error?.message || 'Ocorrência não encontrada'} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <OccurrenceDetailContent
        occurrence={occurrence}
        canStart={canStart}
        canResolve={canResolve}
        canCancel={canCancel}
        canCreateDispatch={canCreateDispatch}
        onBack={() => navigate('/')}
        onStart={handleStart}
        onResolve={() => setShowConfirmResolveModal(true)}
        onCancel={() => setShowConfirmCancelModal(true)}
        onCreateDispatch={() => setShowDispatchModal(true)}
        onUpdateDispatchStatus={handleUpdateDispatchStatus}
        isStarting={startMutation.isPending}
        isResolving={resolveMutation.isPending}
        isCancelling={cancelMutation.isPending}
        isUpdatingDispatch={updateDispatchStatusMutation.isPending}
        updatingDispatchId={updatingDispatchId}
        processingCommandIds={processingDispatchCommandIds}
        processingMessage={processingMessage}
        processingError={processingError}
        startError={startMutation.error}
        resolveError={resolveMutation.error}
        cancelError={cancelMutation.error}
      />

      <OccurrenceDetailModals
        showDispatchModal={showDispatchModal}
        showConfirmResolveModal={showConfirmResolveModal}
        showConfirmCancelModal={showConfirmCancelModal}
        onCreateDispatchClose={() => setShowDispatchModal(false)}
        onCreateDispatchSubmit={handleCreateDispatch}
        onConfirmResolveClose={() => setShowConfirmResolveModal(false)}
        onConfirmResolve={handleResolve}
        onConfirmCancelClose={() => setShowConfirmCancelModal(false)}
        onConfirmCancel={handleCancel}
        isCreatingDispatch={createDispatchMutation.isPending}
        isResolving={resolveMutation.isPending}
        isCancelling={cancelMutation.isPending}
        processingDispatchCount={processingDispatchCommandIds.size}
        commandStatuses={commandStatuses}
      />
    </>
  );
};
