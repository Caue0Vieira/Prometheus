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
    processingMessage,
    processingError,
    updatingDispatchId,
    processingDispatchCommandId,
    canStart,
    canResolve,
    canCreateDispatch,
    startMutation,
    resolveMutation,
    createDispatchMutation,
    updateDispatchStatusMutation,
    handleStart,
    handleResolve,
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
        canCreateDispatch={canCreateDispatch}
        onBack={() => navigate('/')}
        onStart={handleStart}
        onResolve={() => setShowConfirmResolveModal(true)}
        onCreateDispatch={() => setShowDispatchModal(true)}
        onUpdateDispatchStatus={handleUpdateDispatchStatus}
        isStarting={startMutation.isPending}
        isResolving={resolveMutation.isPending}
        isUpdatingDispatch={updateDispatchStatusMutation.isPending}
        updatingDispatchId={updatingDispatchId}
        processingCommandId={processingDispatchCommandId}
        processingMessage={processingMessage}
        processingError={processingError}
        startError={startMutation.error}
        resolveError={resolveMutation.error}
      />

      <OccurrenceDetailModals
        showDispatchModal={showDispatchModal}
        showConfirmResolveModal={showConfirmResolveModal}
        onCreateDispatchClose={() => setShowDispatchModal(false)}
        onCreateDispatchSubmit={handleCreateDispatch}
        onConfirmResolveClose={() => setShowConfirmResolveModal(false)}
        onConfirmResolve={handleResolve}
        isCreatingDispatch={createDispatchMutation.isPending}
        isResolving={resolveMutation.isPending}
      />
    </>
  );
};
