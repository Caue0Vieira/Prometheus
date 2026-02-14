import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useOccurrenceDetail,
  useStartOccurrence,
  useResolveOccurrence,
  useUpdateDispatchStatus,
} from './';
import { createDispatch } from '../api/occurrences';
import { pollCommandAndSync } from './utils';
import { useToast } from '../contexts/ToastContext';

export const useOccurrenceDetailPage = (occurrenceId: string | undefined) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Estados de UI
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showConfirmResolveModal, setShowConfirmResolveModal] = useState(false);
  const [updatingDispatchId, setUpdatingDispatchId] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingDispatchCommandId, setProcessingDispatchCommandId] = useState<string | null>(null);

  // Queries e mutations
  const { data, isLoading, error } = useOccurrenceDetail(occurrenceId);
  const startMutation = useStartOccurrence();
  const resolveMutation = useResolveOccurrence();
  const updateDispatchStatusMutation = useUpdateDispatchStatus();

  // Mutation para criar despacho
  const createDispatchMutation = useMutation({
    mutationFn: ({ occurrenceId, data }: { occurrenceId: string; data: { resourceCode: string } }) =>
      createDispatch(occurrenceId, data),
    onSuccess: async (response, variables) => {
      const commandId = (response as { commandId: string }).commandId;
      const status = (response as { status: string }).status;

      // Rastreia o commandId para exibir badge "Processando..." durante o polling
      setProcessingDispatchCommandId(commandId);

      // Se o status for "accepted", fecha o modal e mostra toast
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
          setProcessingDispatchCommandId(null);
          showError('Erro ao processar despacho. Tente novamente.');
        },
      });
      // Limpa o estado de processamento quando o comando for processado com sucesso
      setProcessingDispatchCommandId(null);
    },
  });

  // Handlers
  const handleStart = async () => {
    if (!occurrenceId) return;

    setProcessingError(null);
    setProcessingMessage('Iniciando atendimento...');

    try {
      await startMutation.mutateAsync(occurrenceId);
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
    if (!occurrenceId) return;

    setProcessingError(null);
    setProcessingMessage('Encerrando ocorrência...');
    setShowConfirmResolveModal(false);

    try {
      await resolveMutation.mutateAsync(occurrenceId);
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
    if (!occurrenceId) return;

    try {
      await createDispatchMutation.mutateAsync({
        occurrenceId,
        data: { resourceCode },
      });
    } catch (err: unknown) {
      setShowDispatchModal(false);
      console.error('Erro ao criar despacho:', err);
      const errorMessage =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao criar despacho';
      showError(errorMessage);
    }
  };

  const handleUpdateDispatchStatus = async (dispatchId: string, statusCode: string) => {
    if (!occurrenceId) return;

    setUpdatingDispatchId(dispatchId);

    try {
      await updateDispatchStatusMutation.mutateAsync({
        dispatchId,
        statusCode,
        occurrenceId,
      });
    } catch (err) {
      console.error('Erro ao atualizar status do despacho:', err);
      setUpdatingDispatchId(null);
    }
  };

  // Effects
  useEffect(() => {
    if (data?.data && updatingDispatchId && !updateDispatchStatusMutation.isPending) {
      const timer = setTimeout(() => {
        setUpdatingDispatchId(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, updatingDispatchId, updateDispatchStatusMutation.isPending]);

  useEffect(() => {
    if (processingDispatchCommandId && data?.data?.dispatches && data.data.dispatches.length > 0) {
      const timer = setTimeout(() => {
        setProcessingDispatchCommandId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data?.data?.dispatches?.length, processingDispatchCommandId]);

  const occurrence = data?.data;
  const canStart = occurrence?.status_code === 'reported';
  const canResolve = occurrence?.status_code === 'in_progress';

  return {
    // Data
    occurrence,
    isLoading,
    error,

    // UI States
    showDispatchModal,
    setShowDispatchModal,
    showConfirmResolveModal,
    setShowConfirmResolveModal,
    processingMessage,
    processingError,
    updatingDispatchId,
    processingDispatchCommandId,

    // Permissions
    canStart,
    canResolve,
    canCreateDispatch: canStart || canResolve,

    // Mutations
    startMutation,
    resolveMutation,
    createDispatchMutation,
    updateDispatchStatusMutation,

    // Handlers
    handleStart,
    handleResolve,
    handleCreateDispatch,
    handleUpdateDispatchStatus,
  };
};

