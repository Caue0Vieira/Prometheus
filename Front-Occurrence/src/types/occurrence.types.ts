import type {Dispatch} from './dispatch.types';

export type OccurrenceStatus = string;

export type OccurrenceType = string;

export interface Occurrence {
    id: string;
    external_id: string;
    type_code: string;
    type_name?: string | null;
    type_category?: string | null;
    status_code: string;
    status_name?: string | null;
    status_is_final?: boolean | null;
    description: string;
    reported_at: string;
    created_at: string;
    updated_at: string;
    dispatches?: Dispatch[];
}

export interface OccurrenceDetail extends Occurrence {
    dispatches: Dispatch[];
}

export interface OccurrencesListResponse {
    data: Occurrence[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface OccurrenceDetailResponse {
    data: OccurrenceDetail;
}