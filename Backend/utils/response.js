/**
 * Standard Response Format Utilities
 */

// Success Response
const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

// Error Response
const errorResponse = (message = 'Error', statusCode = 500, errors = null) => ({
  success: false,
  message,
  statusCode,
  ...(errors && { errors }),
  timestamp: new Date().toISOString()
});

// Paginated Response
const paginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => ({
  success: true,
  message,
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit)
  },
  timestamp: new Date().toISOString()
});

// List Response with Count
const listResponse = (data, count, message = 'Data retrieved successfully') => ({
  success: true,
  message,
  data,
  count,
  timestamp: new Date().toISOString()
});

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  listResponse
};
