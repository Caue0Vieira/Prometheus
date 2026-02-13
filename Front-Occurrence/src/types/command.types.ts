export type CommandStatus = 'pending' | 'processed' | 'failed' | 'accepted';

export interface CommandResponse {
    commandId: string;
    status: string;
}

export interface CommandStatusResponse {
    commandId: string;
    status: CommandStatus;
    result: any | null;
    error: string | null;
    errorMessage?: string | null;
    processedAt?: string | null;
}
