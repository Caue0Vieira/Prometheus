/**
 * Componente StatusBadge para exibir status com cores
 * Usa status_name retornado pela API (já em português) e status_code para cores
 */

import { OccurrenceStatus, DispatchStatus } from '../../types';

interface StatusBadgeProps {
  status: OccurrenceStatus | DispatchStatus | string; // status_code da API
  statusName?: string | null; // status_name da API (já em português)
  size?: 'sm' | 'md' | 'lg';
}

// Configuração de cores baseada no status_code
const statusColorConfig: Record<string, string> = {
  // Occurrence Status
  reported: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  
  // Dispatch Status
  assigned: 'bg-blue-100 text-blue-800',
  en_route: 'bg-orange-100 text-orange-800',
  on_site: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-800',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const StatusBadge = ({ status, statusName, size = 'md' }: StatusBadgeProps) => {
  // A API sempre retorna status_name em português, então usa diretamente
  const label = statusName || status;
  const color = statusColorConfig[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${color} ${sizeStyles[size]}`}
    >
      {label}
    </span>
  );
};

