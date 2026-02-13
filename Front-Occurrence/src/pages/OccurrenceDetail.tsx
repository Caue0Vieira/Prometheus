import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useOccurrenceDetail,
  useStartOccurrence,
  useResolveOccurrence,
  useUpdateDispatchStatus,
} from '../hooks';
import { createDispatch } from '../api/occurrences';
import { pollCommandAndSync } from '../hooks/utils';
import { LoadingSpinner, ErrorAlert, Button } from '../components/common';
import {
  OccurrenceHeader,
  OccurrenceInfo,
  OccurrenceActions,
  DispatchList,
  CreateDispatchModal,
} from '../components/occurrence';
import { useToast } from '../contexts/ToastContext';

export const OccurrenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [updatingDispatchId, setUpdatingDispatchId] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingDispatchCommandId, setProcessingDispatchCommandId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useOccurrenceDetail(id);
  const startMutation = useStartOccurrence();
  const resolveMutation = useResolveOccurrence();
  
  // Hook customizado para criar despacho
  const createDispatchMutation = useMutation({
    mutationFn: ({ occurrenceId, data }: { occurrenceId: string; data: { resourceCode: string } }) =>
      createDispatch(occurrenceId, data),
    onSuccess: async (response, variables) => {
      const commandId = (response as { commandId: string }).commandId;
      const status = (response as { status: string }).status;
      
      // Rastreia o commandId para exibir badge "Processando..." durante o polling
      setProcessingDispatchCommandId(commandId);
      
      // Se o status for "accepted", fecha o modal e mostra toast
      // O polling continuará em background para atualizar o status
      if (status === 'accepted') {
        setShowDispatchModal(false);
        showSuccess('Despacho criado com sucesso! Processando...');
      }
      
      // Inicia o polling para acompanhar o processamento
      await pollCommandAndSync({
        queryClient,
        commandId,
        occurrenceId: variables.occurrenceId,
        actionLabel: 'createDispatch',
        rollbackOnError: () => {
          // Em caso de erro no polling, limpa o estado
          setProcessingDispatchCommandId(null);
          showError('Erro ao processar despacho. Tente novamente.');
        },
      });
      // Limpa o estado de processamento quando o comando for processado com sucesso
      setProcessingDispatchCommandId(null);
    },
  });
  
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

  // Limpa o estado de processamento quando a ocorrência é atualizada após polling (fallback)
  // O callback do polling também limpa, mas este é um fallback caso o callback não seja chamado
  useEffect(() => {
    if (processingDispatchCommandId && occurrence?.dispatches && occurrence.dispatches.length > 0) {
      // Quando o polling atualiza, um novo dispatch aparece na lista
      // Limpa o estado após um pequeno delay para garantir que a UI foi atualizada
      const timer = setTimeout(() => {
        setProcessingDispatchCommandId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [occurrence?.dispatches, occurrence?.dispatches.length, processingDispatchCommandId]);

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

    try {
      // Chama a mutation - o onSuccess já trata o fechamento do modal e toast quando status for "accepted"
      await createDispatchMutation.mutateAsync({
        occurrenceId: id,
        data: { resourceCode },
      });
      
      // O polling e fechamento do modal já são tratados no onSuccess do mutation
    } catch (err: unknown) {
      // Fecha o modal mesmo em caso de erro
      setShowDispatchModal(false);
      
      console.error('Erro ao criar despacho:', err);
      const errorMessage =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao criar despacho';
      // Exibe toast de erro
      showError(errorMessage);
    }
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
          processingCommandId={processingDispatchCommandId}
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
