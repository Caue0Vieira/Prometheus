import { useQuery } from '@tanstack/react-query';
import { getOccurrenceTypes, OccurrenceTypesResponse } from '../api/occurrences';

export const useOccurrenceTypes = () => {
  return useQuery<OccurrenceTypesResponse, Error>({
    queryKey: ['occurrence-types'],
    queryFn: async () => {
      try {
        return await getOccurrenceTypes();
      } catch (error) {
        console.error('Erro ao buscar tipos de ocorrência:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos (tipos mudam raramente)
    retry: 2,
  });
};

