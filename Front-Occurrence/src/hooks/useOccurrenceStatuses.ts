import { useQuery } from '@tanstack/react-query';
import { getOccurrenceStatuses, OccurrenceStatusesResponse } from '../api/occurrences';

export const useOccurrenceStatuses = () => {
  return useQuery<OccurrenceStatusesResponse, Error>({
    queryKey: ['occurrence-status'],
    queryFn: async () => {
      try {
        return await getOccurrenceStatuses();
      } catch (error) {
        console.error('Erro ao buscar status de ocorrência:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

