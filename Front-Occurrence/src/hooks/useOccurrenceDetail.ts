import { useQuery } from '@tanstack/react-query';
import { getOccurrenceDetail } from '../api/occurrences';
import { OccurrenceDetailResponse } from '../types';

export const useOccurrenceDetail = (id: string | undefined) => {
  return useQuery<OccurrenceDetailResponse, Error>({
    queryKey: ['occurrence', id],
    queryFn: () => getOccurrenceDetail(id!),
    enabled: !!id,
    refetchInterval: 15000, // Atualiza a cada 15 segundos
    staleTime: 5000,
  });
};

