export type CommandStatus = 'RECEIVED' | 'ENQUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

export interface CommandResponse {
    command_id: string;
    status: CommandStatus;
}

export interface CommandStatusResponse {
    command_id: string;
    status: CommandStatus;
    result: any | null;
    error_message: string | null;
    processed_at?: string | null;
}
