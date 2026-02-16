import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useOccurrenceDetail,
  useStartOccurrence,
  useResolveOccurrence,
  useUpdateDispatchStatus,
} from './';
import { createDispatch } from '../api/occurrences';
import { pollCommandStatus } from '../utils/polling';
import { invalidateOccurrenceQueries } from './utils';
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
  const [processingDispatchCommandIds, setProcessingDispatchCommandIds] = useState<Set<string>>(new Set());
  const [commandStatuses, setCommandStatuses] = useState<Map<string, string>>(new Map());

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
      const commandId = (response as { command_id: string }).command_id;
      const status = (response as { status: string }).status;

      // Adiciona o comando ao conjunto de comandos em processamento
      setProcessingDispatchCommandIds((prev) => new Set(prev).add(commandId));
      setCommandStatuses((prev) => new Map(prev).set(commandId, status));

      // Se o comando foi recebido/enfileirado, mostra toast mas mantém o modal aberto
      if (status === 'ENQUEUED' || status === 'RECEIVED') {
        showSuccess('Despacho criado com sucesso! Processando...');
      }

      // Inicia o polling de forma assíncrona (não bloqueia a mutation)
      pollCommandStatus(commandId, {
        onStatusChange: (newStatus) => {
          setCommandStatuses((prev) => new Map(prev).set(commandId, newStatus));
        },
        onSuccess: (result) => {
          console.log(`Comando createDispatch processado com sucesso`, { commandId, result });
          invalidateOccurrenceQueries(queryClient, variables.occurrenceId);
          setProcessingDispatchCommandIds((prev) => {
            const next = new Set(prev);
            next.delete(commandId);
            return next;
          });
          setCommandStatuses((prev) => {
            const next = new Map(prev);
            next.delete(commandId);
            return next;
          });
        },
        onError: (errorMessage) => {
          setProcessingDispatchCommandIds((prev) => {
            const next = new Set(prev);
            next.delete(commandId);
            return next;
          });
          setCommandStatuses((prev) => {
            const next = new Map(prev);
            next.delete(commandId);
            return next;
          });
          showError('Erro ao processar despacho. Tente novamente.');
        },
        onTimeout: () => {
          console.warn(`Timeout ao processar comando createDispatch. Os dados podem estar desatualizados.`);
          invalidateOccurrenceQueries(queryClient, variables.occurrenceId);
          setProcessingDispatchCommandIds((prev) => {
            const next = new Set(prev);
            next.delete(commandId);
            return next;
          });
          setCommandStatuses((prev) => {
            const next = new Map(prev);
            next.delete(commandId);
            return next;
          });
        },
      });
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
    processingDispatchCommandIds,
    commandStatuses,

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

