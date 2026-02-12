export const generateIdempotencyKey = (): string => {
  return `frontend-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

