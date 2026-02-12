import { useQuery } from '@tanstack/react-query';
import { listOccurrences, ListOccurrencesParams } from '../api/occurrences';
import { OccurrencesListResponse } from '../types';

export const useOccurrences = (params: ListOccurrencesParams = {}) => {
  return useQuery<OccurrencesListResponse, Error>({
    queryKey: ['occurrences', params],
    queryFn: async () => {
      try {
        return await listOccurrences(params);
      } catch (error) {
        console.error('Erro ao buscar ocorrências:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 10000, // Considera os dados "frescos" por 10 segundos
    retry: 1,
  });
};

