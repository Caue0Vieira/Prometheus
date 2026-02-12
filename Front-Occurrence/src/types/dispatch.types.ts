export type DispatchStatus =
    | 'assigned'
    | 'en_route'
    | 'on_site'
    | 'closed';

export interface Dispatch {
    id: string;
    occurrence_id?: string;
    resource_code: string;
    status_code: string;
    status_name?: string | null;
    status_is_active?: boolean | null;
    created_at: string;
    updated_at?: string;
}

export interface CreateDispatchRequest {
    resourceCode: string;
}