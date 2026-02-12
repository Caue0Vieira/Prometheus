// Tipos de Ocorrências
export type {
  OccurrenceStatus,
  OccurrenceType,
  Occurrence,
  OccurrenceDetail,
  OccurrencesListResponse,
  OccurrenceDetailResponse,
} from './occurrence.types';

// Tipos de Despachos
export type {
  DispatchStatus,
  Dispatch,
  CreateDispatchRequest,
} from './dispatch.types';

// Tipos de Comandos
export type {
  CommandStatus,
  CommandResponse,
  CommandStatusResponse,
} from './command.types';

// Tipos genéricos da API
export type {
  ApiError,
  PaginationMeta,
} from './api.types';
