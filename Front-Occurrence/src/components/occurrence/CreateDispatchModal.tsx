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
}

export const CreateDispatchModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateDispatchModalProps) => {
  const [resourceCode, setResourceCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resourceCode.trim()) {
      setError('Código do recurso é obrigatório');
      return;
    }

    setError(null);

    try {
      await onSubmit(resourceCode.trim());
      setResourceCode('');
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao criar despacho';
      setError(errorMessage);
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
            onChange={(e) => {
              setResourceCode(e.target.value);
              setError(null);
            }}
            error={error || undefined}
            required
          />
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

