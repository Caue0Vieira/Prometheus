import {getCommandStatus} from '../api/commands';
import {CommandStatus, CommandStatusResponse} from '../types';

export interface PollingOptions {
    intervalMs?: number;
    maxAttempts?: number;
    onPending?: (attempt: number) => void;
    onStatusChange?: (status: CommandStatus) => void;
    onSuccess?: (result: any | null) => void;
    onError?: (errorMessage: string | null) => void;
    onTimeout?: () => void;
}


export const pollCommandStatus = async (
    commandId: string,
    options: PollingOptions = {}
): Promise<CommandStatusResponse> => {
    const {
        intervalMs = 1000,
        maxAttempts = 20,
        onPending,
        onStatusChange,
        onSuccess,
        onError,
        onTimeout,
    } = options;

    let lastStatus: CommandStatus | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const status = await getCommandStatus(commandId);

            if (onStatusChange && status.status !== lastStatus) {
                onStatusChange(status.status);
                lastStatus = status.status;
            }

            if (status.status === 'RECEIVED' || status.status === 'ENQUEUED' || status.status === 'PROCESSING') {
                if (onPending) {
                    onPending(attempt + 1);
                }
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
                continue;
            }

            if (status.status === 'SUCCEEDED') {
                if (onSuccess) {
                    onSuccess(status.result);
                }
                return status;
            }

            if (status.status === 'FAILED') {
                if (onError) {
                    onError(status.error_message || null);
                }
                return status;
            }

            console.warn(`Status desconhecido recebido: ${status.status}. Tratando como pendente.`);
            if (onPending) {
                onPending(attempt + 1);
            }
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        } catch (error) {
            console.error(`Erro ao consultar status do comando (tentativa ${attempt + 1}):`, error);
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
    }

    if (onTimeout) {
        onTimeout();
    }

    // Retorna um objeto indicando timeout
    return {
        command_id: commandId,
        status: 'PROCESSING' as CommandStatus,
        result: null,
        error_message: 'Timeout: O comando ainda está sendo processado. Tente novamente em alguns segundos.',
        processed_at: null,
    };
};