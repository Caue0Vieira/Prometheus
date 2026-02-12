/**
 * Hooks para mutações de ocorrências
 * Integra polling automático para comandos assíncronos
 */

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
    startOccurrence,
    resolveOccurrence,
    createDispatch,
    updateDispatchStatus,
} from '../api/occurrences';
import {CommandResponse, CreateDispatchRequest, OccurrenceDetail, Dispatch} from '../types';
import {
    updateOccurrenceCache,
    getOccurrenceSnapshot,
    rollbackOccurrenceCache,
    pollCommandAndSync,
    type OccurrenceContext,
} from './utils';

const STATUS_NAMES: Record<string, string> = {
    en_route: 'A Caminho',
    on_site: 'No Local',
    closed: 'Encerrado',
};

/**
 * Factory para hooks de mudança de status de ocorrência
 */
const createOccurrenceStatusMutation = (
    mutationFn: (id: string) => Promise<CommandResponse>,
    statusCode: string,
    statusName: string,
    actionLabel: string
) => {
    return () => {
        const queryClient = useQueryClient();

        return useMutation<CommandResponse, Error, string, OccurrenceContext>({
            mutationFn,
            onMutate: async (id) => {
                await queryClient.cancelQueries({queryKey: ['occurrence', id]});
                const previousOccurrence = getOccurrenceSnapshot(queryClient, id);

                updateOccurrenceCache(queryClient, id, (current: OccurrenceDetail) => ({
                    ...current,
                    status_code: statusCode,
                    status_name: statusName,
                    updated_at: new Date().toISOString(),
                }));

                return {previousOccurrence};
            },
            onSuccess: async (response, id) => {
                await pollCommandAndSync({
                    queryClient,
                    commandId: (response as unknown as { commandId: string }).commandId,
                    occurrenceId: id,
                    actionLabel,
                    rollbackOnError: () => {
                        rollbackOccurrenceCache(queryClient, id, {
                            previousOccurrence: getOccurrenceSnapshot(queryClient, id),
                        });
                    },
                });
            },
            onError: (_err, id, context) => {
                rollbackOccurrenceCache(queryClient, id, context);
            },
        });
    };
};

export const useStartOccurrence = createOccurrenceStatusMutation(
    startOccurrence,
    'in_progress',
    'Em Atendimento',
    'start'
);

export const useResolveOccurrence = createOccurrenceStatusMutation(
    resolveOccurrence,
    'resolved',
    'Resolvida',
    'resolve'
);

/**
 * Hook para criar um despacho
 */
export const useCreateDispatch = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CommandResponse,
        Error,
        { occurrenceId: string; data: CreateDispatchRequest }
    >({
        mutationFn: ({occurrenceId, data}) => createDispatch(occurrenceId, data),
        onSuccess: async (response, variables) => {
            await pollCommandAndSync({
                queryClient,
                commandId: (response as unknown as { commandId: string }).commandId,
                occurrenceId: variables.occurrenceId,
                actionLabel: 'createDispatch',
            });
        },
    });
};

/**
 * Hook para atualizar o status de um despacho
 */
export const useUpdateDispatchStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CommandResponse,
        Error,
        { dispatchId: string; statusCode: string; occurrenceId: string },
        OccurrenceContext
    >({
        mutationFn: ({dispatchId, statusCode}) => updateDispatchStatus(dispatchId, statusCode),
        onMutate: async ({dispatchId, statusCode, occurrenceId}) => {
            await queryClient.cancelQueries({queryKey: ['occurrence', occurrenceId]});
            const previousOccurrence = getOccurrenceSnapshot(queryClient, occurrenceId);

            updateOccurrenceCache(queryClient, occurrenceId, (current: OccurrenceDetail) => ({
                ...current,
                dispatches: current.dispatches.map((dispatch: Dispatch) =>
                    dispatch.id === dispatchId
                        ? {
                                ...dispatch,
                                status_code: statusCode,
                                status_name: STATUS_NAMES[statusCode] || statusCode,
                                updated_at: new Date().toISOString(),
                            }
                        : dispatch
                ),
            }));

            return {previousOccurrence};
        },
        onError: (_err, variables, context) => {
            rollbackOccurrenceCache(queryClient, variables.occurrenceId, context);
        },
        onSuccess: async (response, variables) => {
            await pollCommandAndSync({
                queryClient,
                commandId: (response as unknown as { commandId: string }).commandId,
                occurrenceId: variables.occurrenceId,
                actionLabel: 'updateDispatchStatus',
                rollbackOnError: () => {
                    rollbackOccurrenceCache(queryClient, variables.occurrenceId, {
                        previousOccurrence: getOccurrenceSnapshot(queryClient, variables.occurrenceId),
                    });
                },
            });
        },
    });
};
