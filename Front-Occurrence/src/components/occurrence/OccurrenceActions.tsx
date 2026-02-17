/**
 * Componente de ações da ocorrência
 */

import { Button, LoadingSpinner, ErrorAlert } from '../common';

interface OccurrenceActionsProps {
  canStart: boolean;
  canResolve: boolean;
  canCancel: boolean;
  canCreateDispatch: boolean;
  onStart: () => void;
  onResolve: () => void;
  onCancel: () => void;
  onCreateDispatch: () => void;
  isStarting: boolean;
  isResolving: boolean;
  isCancelling: boolean;
  processingMessage: string | null;
  processingError: string | null;
  startError?: Error | null;
  resolveError?: Error | null;
  cancelError?: Error | null;
}

export const OccurrenceActions = ({
  canStart,
  canResolve,
  canCancel,
  canCreateDispatch,
  onStart,
  onResolve,
  onCancel,
  onCreateDispatch,
  isStarting,
  isResolving,
  isCancelling,
  processingMessage,
  processingError,
  startError,
  resolveError,
  cancelError,
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

        {canCancel && (
          <Button variant="warning" onClick={onCancel} isLoading={isCancelling}>
            Cancelar Ocorrência
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

      {(startError || resolveError || cancelError || processingError) && (
        <div className="mt-4">
          <ErrorAlert
            message={
              processingError ||
              startError?.message ||
              resolveError?.message ||
              cancelError?.message ||
              'Erro ao executar ação'
            }
          />
        </div>
      )}
    </div>
  );
};

