/**
 * Serviços de API para ocorrências
 */

import apiClient from './client';
import {
  OccurrencesListResponse,
  OccurrenceDetailResponse,
  CommandResponse,
  CreateDispatchRequest,
} from '../types';

export interface ListOccurrencesParams {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Lista ocorrências com filtros opcionais
 */
export const listOccurrences = async (
  params: ListOccurrencesParams = {}
): Promise<OccurrencesListResponse> => {
  const response = await apiClient.get<OccurrencesListResponse>('/occurrences', {
    params,
  });
  return response.data;
};

/**
 * Busca detalhes de uma ocorrência específica
 */
export const getOccurrenceDetail = async (
  id: string
): Promise<OccurrenceDetailResponse> => {
  const response = await apiClient.get<OccurrenceDetailResponse>(`/occurrences/${id}`);
  return response.data;
};

/**
 * Inicia atendimento de uma ocorrência
 */
export const startOccurrence = async (id: string): Promise<CommandResponse> => {
  const response = await apiClient.post<CommandResponse>(`/occurrences/${id}/start`);
  return response.data;
};

/**
 * Resolve/encerra uma ocorrência
 */
export const resolveOccurrence = async (id: string): Promise<CommandResponse> => {
  const response = await apiClient.post<CommandResponse>(`/occurrences/${id}/resolve`);
  return response.data;
};

/**
 * Cria um despacho para uma ocorrência
 */
export const createDispatch = async (
  occurrenceId: string,
  data: CreateDispatchRequest
): Promise<CommandResponse> => {
  const response = await apiClient.post<CommandResponse>(
    `/occurrences/${occurrenceId}/dispatches`,
    data
  );
  return response.data;
};

/**
 * Atualiza o status de um despacho
 */
export const updateDispatchStatus = async (
  dispatchId: string,
  statusCode: string
): Promise<CommandResponse> => {
  const response = await apiClient.patch<CommandResponse>(
    `/dispatches/${dispatchId}/status`,
    { statusCode }
  );
  return response.data;
};

/**
 * Busca todos os tipos de ocorrência disponíveis
 */
export interface OccurrenceType {
  code: string;
  name: string;
}

export interface OccurrenceTypesResponse {
  data: OccurrenceType[];
}

export const getOccurrenceTypes = async (): Promise<OccurrenceTypesResponse> => {
  const response = await apiClient.get<OccurrenceTypesResponse>('/occurrences/types');
  return response.data;
};

