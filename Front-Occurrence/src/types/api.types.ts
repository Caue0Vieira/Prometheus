export interface ApiError {
    error: string;
    message: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
}