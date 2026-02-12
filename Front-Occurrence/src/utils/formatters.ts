import {format, parseISO, parse} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

/**
 * Converte uma string de data para objeto Date
 * Aceita formatos ISO 8601 e 'Y-m-d H:i:s' (formato retornado pela API)
 */
const parseDate = (dateString: string): Date => {
    const isISOFormat = dateString.includes('T') || dateString.match(/[+-]\d{2}:\d{2}$/);

    if (isISOFormat) {
        const isoDate = parseISO(dateString);
        if (!isNaN(isoDate.getTime())) {
            return isoDate;
        }
    }

    try {
        const parsedDate = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    } catch {
        // Continua para fallback
    }

    // Fallback: tenta parseISO mesmo que não seja formato ISO
    const fallbackDate = parseISO(dateString);
    if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
    }

    // Se tudo falhar, retorna data inválida
    return new Date(NaN);
};

/**
 * Formata uma data para formato brasileiro
 * Aceita formatos ISO 8601 e 'Y-m-d H:i:s'
 */
export const formatDate = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return format(date, "dd/MM/yyyy 'às' HH:mm", {locale: ptBR});
    } catch {
        return dateString;
    }
};

/**
 * Formata apenas a data (sem hora)
 * Aceita formatos ISO 8601 e 'Y-m-d H:i:s'
 */
export const formatDateOnly = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return format(date, 'dd/MM/yyyy', {locale: ptBR});
    } catch {
        return dateString;
    }
};

export const formatOccurrenceType = (typeCode: string, typeName?: string | null): string => {
    return typeName || typeCode;
};

