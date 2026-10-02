/**
 * Normalizes backend response envelopes.
 * Backend success shape: { success: true, message: "...", data: ... }
 * Backend error shape: { success: false, message: "...", errors: [{ field, message }] }
 */

export function normalizeResponse(response) {
  const data = response?.data;
  if (!data) return null;

  // If response is already unwrapped or direct data
  if (data.success !== undefined) {
    return data.data !== undefined ? data.data : data;
  }
  return data;
}

export function normalizePagination(data) {
  if (!data) return { items: [], page: 1, limit: 10, total: 0, totalPages: 1 };

  // Handle standard { items: [], page, limit, total, totalPages }
  if (Array.isArray(data.items)) {
    return {
      items: data.items,
      page: data.page || 1,
      limit: data.limit || 10,
      total: data.total || data.items.length,
      totalPages: data.totalPages || 1,
    };
  }

  // Fallback if data is a raw array
  if (Array.isArray(data)) {
    return {
      items: data,
      page: 1,
      limit: data.length,
      total: data.length,
      totalPages: 1,
    };
  }

  return { items: [], page: 1, limit: 10, total: 0, totalPages: 1 };
}

export function normalizeError(error) {
  if (!error.response) {
    return {
      status: 0,
      message: error.message || 'Network error. Please check your connection.',
      fieldErrors: {},
    };
  }

  const status = error.response.status;
  const data = error.response.data || {};
  const message = data.message || error.message || 'An unexpected error occurred.';

  const fieldErrors = {};
  if (Array.isArray(data.errors)) {
    data.errors.forEach((err) => {
      if (err.field) {
        fieldErrors[err.field] = err.message || err.msg || 'Invalid value';
      }
    });
  } else if (data.errors && typeof data.errors === 'object') {
    Object.assign(fieldErrors, data.errors);
  }

  return {
    status,
    message,
    fieldErrors,
    raw: data,
  };
}
