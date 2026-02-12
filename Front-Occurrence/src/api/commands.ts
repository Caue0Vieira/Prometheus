/**
 * Serviços de API para consulta de status de comandos assíncronos
 */

import apiClient from './client';
import { CommandStatusResponse } from '../types';

/**
 * Consulta o status de um comando assíncrono
 * @param commandId - ID do comando retornado pela API após POST assíncrono
 * @returns Status atual do comando (pending, processed, failed)
 */
export const getCommandStatus = async (
  commandId: string
): Promise<CommandStatusResponse> => {
  const response = await apiClient.get<CommandStatusResponse>(
    `/commands/${commandId}`
  );
  return response.data;
};

