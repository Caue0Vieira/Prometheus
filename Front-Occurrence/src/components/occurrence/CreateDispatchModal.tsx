/**
 * Modal para criar um novo despacho
 */

import { useState } from 'react';
import { Modal, Input, Button } from '../common';

interface CreateDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceCode: string) => Promise<void>;
  isLoading: boolean;
  processingCount?: number;
  commandStatuses?: Map<string, string>;
}

export const CreateDispatchModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  processingCount = 0,
  commandStatuses = new Map(),
}: CreateDispatchModalProps) => {
  const [resourceCode, setResourceCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const RESOURCE_CODE_PATTERN = /^[A-Z]{2,3}-\d{2}$/;

  const validateResourceCode = (value: string): string | null => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return 'Código do recurso é obrigatório';
    }

    if (!RESOURCE_CODE_PATTERN.test(trimmed)) {
      return 'Formato inválido. Use o padrão ABT-12 ou UR-05 (2-3 letras, hífen, 2 dígitos)';
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    value = value.replace(/[^A-Z0-9-]/g, '');
    
    const parts = value.split('-');
    if (parts.length > 2) {
      value = parts[0] + '-' + parts.slice(1).join('');
    }
    
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    
    setResourceCode(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = resourceCode.trim();
    const validationError = validateResourceCode(trimmedCode);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      await onSubmit(trimmedCode);
      setResourceCode('');
      setError(null);
    } catch (err: unknown) {
      setResourceCode('');
      throw err;
    }
  };

  const handleClose = () => {
    setResourceCode('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Criar Despacho" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Código do Recurso"
            placeholder="Ex: ABT-12"
            value={resourceCode}
            onChange={handleInputChange}
            error={error || undefined}
            required
            maxLength={6}
            style={{ textTransform: 'uppercase' }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Formato: 2-3 letras, hífen, 2 dígitos (ex: ABT-12, UR-05)
          </p>
          {processingCount > 0 && (
            <div className="mt-3 space-y-2">
              {Array.from(commandStatuses.entries()).map(([commandId, status]) => {
                const getStatusLabel = (status: string) => {
                  switch (status) {
                    case 'RECEIVED':
                      return 'Recebido';
                    case 'ENQUEUED':
                      return 'Enfileirado';
                    case 'PROCESSING':
                      return 'Processando';
                    case 'SUCCEEDED':
                      return 'Concluído';
                    case 'FAILED':
                      return 'Falhou';
                    default:
                      return 'Processando';
                  }
                };

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'RECEIVED':
                      return 'text-blue-600';
                    case 'ENQUEUED':
                      return 'text-yellow-600';
                    case 'PROCESSING':
                      return 'text-blue-600';
                    case 'SUCCEEDED':
                      return 'text-green-600';
                    case 'FAILED':
                      return 'text-red-600';
                    default:
                      return 'text-gray-600';
                  }
                };

                const isProcessing = status === 'RECEIVED' || status === 'ENQUEUED' || status === 'PROCESSING';

                return (
                  <div key={commandId} className={`flex items-center gap-2 text-sm ${getStatusColor(status)}`}>
                    {isProcessing && (
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    <span>
                      {getStatusLabel(status)}
                      {isProcessing && '...'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Criar Despacho
          </Button>
        </div>
      </form>
    </Modal>
  );
};

