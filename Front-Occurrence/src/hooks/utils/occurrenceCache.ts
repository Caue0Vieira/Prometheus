/**
 * Utilitários para gerenciamento de cache de ocorrências
 */

import { QueryClient } from '@tanstack/react-query';
import { pollCommandStatus } from '../../utils/polling';
import type { OccurrenceDetailResponse, OccurrenceDetail } from '../../types';

export type OccurrenceCache = OccurrenceDetailResponse | undefined;

export type OccurrenceContext = {
  previousOccurrence: OccurrenceCache;
};

/**
 * Atualiza o cache de uma ocorrência
 */
export const updateOccurrenceCache = (
  queryClient: QueryClient,
  occurrenceId: string,
  updater: (current: OccurrenceDetail) => OccurrenceDetail
) => {
  queryClient.setQueryData<OccurrenceDetailResponse>(['occurrence', occurrenceId], (old) => {
    if (!old?.data) return old;
    return { ...old, data: updater(old.data) };
  });
};

/**
 * Obtém snapshot atual da ocorrência
 */
export const getOccurrenceSnapshot = (
  queryClient: QueryClient,
  occurrenceId: string
): OccurrenceCache => {
  return queryClient.getQueryData<OccurrenceDetailResponse>(['occurrence', occurrenceId]);
};

/**
 * Restaura snapshot anterior em caso de erro
 */
export const rollbackOccurrenceCache = (
  queryClient: QueryClient,
  occurrenceId: string,
  context?: OccurrenceContext | null
) => {
  if (context?.previousOccurrence) {
    queryClient.setQueryData(['occurrence', occurrenceId], context.previousOccurrence);
  }
};

/**
 * Invalida queries relacionadas a uma ocorrência
 */
export const invalidateOccurrenceQueries = (queryClient: QueryClient, occurrenceId: string) => {
  queryClient.invalidateQueries({ queryKey: ['occurrence', occurrenceId] });
  queryClient.invalidateQueries({ queryKey: ['occurrences'] });
};

/**
 * Polling de comando + sincronização
 * Atualiza página APENAS quando comando for processado
 */
export const pollCommandAndSync = async (params: {
  queryClient: QueryClient;
  commandId: string;
  occurrenceId: string;
  actionLabel: string;
  rollbackOnError?: () => void;
}) => {
  const { queryClient, commandId, occurrenceId, actionLabel, rollbackOnError } = params;

  await pollCommandStatus(commandId, {
    onSuccess: () => invalidateOccurrenceQueries(queryClient, occurrenceId),
    onError: (errorMessage) => {
      if (rollbackOnError) rollbackOnError();
      console.error(`Erro ao processar comando ${actionLabel}:`, errorMessage);
    },
    onTimeout: () => {
      console.warn(`Timeout ao processar comando ${actionLabel}. Os dados podem estar desatualizados.`);
    },
  });
};

