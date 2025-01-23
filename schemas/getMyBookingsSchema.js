const getMyBookingsSchema = {
  schema: {
    description:
      'Retrieve a paginated list of bookings for the authenticated user',
    tags: ['Bookings'],
    security: [{ BearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
          description: 'The page number to retrieve',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          default: 10,
          description: 'The number of bookings to retrieve per page',
        },
      },
    },
    response: {
      200: {
        description: 'Paginated list of bookings',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                booking_id: { type: 'integer', example: 1 },
                booking_status: {
                  type: 'string',
                  enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                  example: 'confirmed',
                },
                number_companion: { type: 'integer', example: 3 },
                total_amount: {
                  type: 'number',
                  format: 'float',
                  example: 300.0,
                },
                created_at: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-01-20T14:30:00.000Z',
                },
                booking_dates: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'date',
                    example: '2025-02-10',
                  },
                },
                muthawwif_name: { type: 'string', example: 'John Doe' },
                mobile_number: { type: 'string', example: '+6281234567890' },
                whatsapp_number: { type: 'string', example: '+6281234567890' },
              },
            },
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 2 },
              totalBookings: { type: 'integer', example: 20 },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized request',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Unauthorized: Missing or invalid token',
          },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to fetch booking list' },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = getMyBookingsSchema
