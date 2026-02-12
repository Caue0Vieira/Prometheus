export type CommandStatus = 'pending' | 'processed' | 'failed';

export interface CommandResponse {
    commandId: string;
    occurrence_id: string;
    status: string;
}

export interface CommandStatusResponse {
    commandId: string;
    status: CommandStatus;
    result: any | null;
    errorMessage: string | null;
    processedAt: string | null;
}
