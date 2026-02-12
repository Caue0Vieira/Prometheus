/**
 * Página de Detalhe da Ocorrência
 * Exibe informações completas, histórico de dispatches e ações
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useOccurrenceDetail,
  useStartOccurrence,
  useResolveOccurrence,
  useCreateDispatch,
  useUpdateDispatchStatus,
} from '../hooks';
import { LoadingSpinner, ErrorAlert, Button } from '../components/common';
import {
  OccurrenceHeader,
  OccurrenceInfo,
  OccurrenceActions,
  DispatchList,
  CreateDispatchModal,
} from '../components/occurrence';

export const OccurrenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [updatingDispatchId, setUpdatingDispatchId] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const { data, isLoading, error } = useOccurrenceDetail(id);
  const startMutation = useStartOccurrence();
  const resolveMutation = useResolveOccurrence();
  const createDispatchMutation = useCreateDispatch();
  const updateDispatchStatusMutation = useUpdateDispatchStatus();

  const occurrence = data?.data;

  const canStart = occurrence?.status_code === 'reported';
  const canResolve = occurrence?.status_code === 'in_progress';

  const getNextStatuses = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      assigned: ['en_route'],
      en_route: ['on_site'],
      on_site: ['closed'],
      closed: [],
    };
    return transitions[currentStatus] || [];
  };

  const handleUpdateDispatchStatus = async (dispatchId: string, statusCode: string) => {
    if (!id) return;

    setUpdatingDispatchId(dispatchId);

    try {
      await updateDispatchStatusMutation.mutateAsync({
        dispatchId,
        statusCode,
        occurrenceId: id,
      });
    } catch (err) {
      console.error('Erro ao atualizar status do despacho:', err);
      setUpdatingDispatchId(null);
    }
  };

  useEffect(() => {
    if (data?.data && updatingDispatchId && !updateDispatchStatusMutation.isPending) {
      const timer = setTimeout(() => {
        setUpdatingDispatchId(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, updatingDispatchId, updateDispatchStatusMutation.isPending]);

  const handleStart = async () => {
    if (!id) return;

    setProcessingError(null);
    setProcessingMessage('Iniciando atendimento...');

    try {
      await startMutation.mutateAsync(id);
      setTimeout(() => setProcessingMessage(null), 2000);
    } catch (err: unknown) {
      console.error('Erro ao iniciar atendimento:', err);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao iniciar atendimento';
      setProcessingError(errorMessage);
      setProcessingMessage(null);
    }
  };

  const handleResolve = async () => {
    if (!id) return;

    if (!window.confirm('Tem certeza que deseja encerrar esta ocorrência?')) {
      return;
    }

    setProcessingError(null);
    setProcessingMessage('Encerrando ocorrência...');

    try {
      await resolveMutation.mutateAsync(id);
      setTimeout(() => setProcessingMessage(null), 2000);
    } catch (err: unknown) {
      console.error('Erro ao encerrar ocorrência:', err);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao encerrar ocorrência';
      setProcessingError(errorMessage);
      setProcessingMessage(null);
    }
  };

  const handleCreateDispatch = async (resourceCode: string) => {
    if (!id) return;

    await createDispatchMutation.mutateAsync({
      occurrenceId: id,
      data: { resourceCode },
    });
    setProcessingMessage('Criando despacho...');
    setTimeout(() => setProcessingMessage(null), 2000);
  };

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
    <div className="container mx-auto px-4 py-8">
      <OccurrenceHeader occurrence={occurrence} onBack={() => navigate('/')} />

      <OccurrenceInfo occurrence={occurrence} />

      <OccurrenceActions
        canStart={canStart}
        canResolve={canResolve}
        canCreateDispatch={canStart || canResolve}
        onStart={handleStart}
        onResolve={handleResolve}
        onCreateDispatch={() => setShowDispatchModal(true)}
        isStarting={startMutation.isPending}
        isResolving={resolveMutation.isPending}
        processingMessage={processingMessage}
        processingError={processingError}
        startError={startMutation.error}
        resolveError={resolveMutation.error}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Despachos</h2>
        <DispatchList
          dispatches={occurrence.dispatches}
          updatingDispatchId={updatingDispatchId}
          isUpdating={updateDispatchStatusMutation.isPending}
          onUpdateStatus={handleUpdateDispatchStatus}
          getNextStatuses={getNextStatuses}
        />
      </div>

      <CreateDispatchModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        onSubmit={handleCreateDispatch}
        isLoading={createDispatchMutation.isPending}
      />
    </div>
  );
};
