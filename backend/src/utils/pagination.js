/**
 * Parse pagination params from query.
 * @param {Object} query - req.query
 * @returns {{ page: number, limit: number, skip: number, sort: Object }}
 */
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  // Parse sort: e.g. '-createdAt' means { createdAt: -1 }
  let sort = { createdAt: -1 };
  if (query.sort) {
    const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
    const sortOrder = query.sort.startsWith('-') ? -1 : 1;
    sort = { [sortField]: sortOrder };
  }

  return { page, limit, skip, sort };
};

/**
 * Build paginated response.
 */
const paginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

module.exports = { parsePagination, paginatedResponse };
