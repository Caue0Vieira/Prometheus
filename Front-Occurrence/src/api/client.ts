/**
 * Cliente HTTP para comunicação com a API
 * Configura Axios com interceptors e headers padrão
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8089/api';
// @ts-ignore
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Gera uma chave de idempotência única baseada em timestamp
 */
export const generateIdempotencyKey = (): string => {
  return `frontend-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Instância do Axios configurada com headers padrão
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
  timeout: 10000,
});

/**
 * Interceptor para adicionar Idempotency-Key em requisições POST/PUT/PATCH
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();
    
    if (method && ['POST', 'PUT', 'PATCH'].includes(method)) {
      // Adiciona Idempotency-Key se não existir
      const headers = config.headers as Record<string, string>;
      if (!headers['Idempotency-Key']) {
        headers['Idempotency-Key'] = generateIdempotencyKey();
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para tratamento de erros
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // Erro com resposta da API
      const apiError = error.response.data;
      console.error('API Error:', {
        status: error.response.status,
        error: apiError?.error || 'Unknown error',
        message: apiError?.message || error.message,
      });
    } else if (error.request) {
      // Erro de rede
      console.error('Network Error:', error.message);
    } else {
      // Outro tipo de erro
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

