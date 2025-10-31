// backend/utils/paginate.js

function paginate(data, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const paginatedItems = data.slice(offset, offset + limit);
  return {
    page,
    limit,
    total: data.length,
    totalPages: Math.ceil(data.length / limit),
    data: paginatedItems
  };
}

module.exports = paginate;
