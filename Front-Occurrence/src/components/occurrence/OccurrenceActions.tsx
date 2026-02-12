/**
 * Componente de ações da ocorrência
 */

import { Button, LoadingSpinner, ErrorAlert } from '../common';

interface OccurrenceActionsProps {
  canStart: boolean;
  canResolve: boolean;
  canCreateDispatch: boolean;
  onStart: () => void;
  onResolve: () => void;
  onCreateDispatch: () => void;
  isStarting: boolean;
  isResolving: boolean;
  processingMessage: string | null;
  processingError: string | null;
  startError?: Error | null;
  resolveError?: Error | null;
}

export const OccurrenceActions = ({
  canStart,
  canResolve,
  canCreateDispatch,
  onStart,
  onResolve,
  onCreateDispatch,
  isStarting,
  isResolving,
  processingMessage,
  processingError,
  startError,
  resolveError,
}: OccurrenceActionsProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações</h2>
      <div className="flex flex-wrap gap-4">
        {canStart && (
          <Button variant="success" onClick={onStart} isLoading={isStarting}>
            Iniciar Atendimento
          </Button>
        )}

        {canResolve && (
          <Button variant="danger" onClick={onResolve} isLoading={isResolving}>
            Encerrar Ocorrência
          </Button>
        )}

        {canCreateDispatch && (
          <Button variant="primary" onClick={onCreateDispatch}>
            Criar Despacho
          </Button>
        )}
      </div>

      {processingMessage && (
        <div className="mt-4 flex items-center gap-2 text-blue-600">
          <LoadingSpinner size="sm" />
          <span className="text-sm">{processingMessage}</span>
        </div>
      )}

      {(startError || resolveError || processingError) && (
        <div className="mt-4">
          <ErrorAlert
            message={
              processingError ||
              startError?.message ||
              resolveError?.message ||
              'Erro ao executar ação'
            }
          />
        </div>
      )}
    </div>
  );
};

