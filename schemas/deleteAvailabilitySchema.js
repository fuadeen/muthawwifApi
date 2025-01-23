const deleteAvailabilitySchema = {
  schema: {
    description:
      'Remove availability dates for the authenticated Muthawwif user. Dates that are already booked cannot be removed.',
    tags: ['Availability'],
    security: [{ BearerAuth: [] }],
    body: {
      type: 'object',
      required: ['dates'],
      properties: {
        dates: {
          type: 'array',
          description:
            'List of dates to remove from availability (YYYY-MM-DD). Dates must be valid and belong to the authenticated user.',
          items: {
            type: 'string',
            format: 'date',
            example: '2025-01-10',
          },
        },
      },
    },
    response: {
      200: {
        description: 'Successfully removed availability dates',
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Availability removed successfully',
          },
          datesRemoved: { type: 'integer', example: 2 },
        },
      },
      400: {
        description: 'Invalid request or non-removable dates',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Some dates do not exist in your availability',
          },
          nonExistentDates: {
            type: 'array',
            description: 'Dates that were not found in the availability',
            items: {
              type: 'string',
              format: 'date',
              example: '2025-01-15',
            },
          },
          bookedDates: {
            type: 'array',
            description: 'Dates that cannot be removed because they are booked',
            items: {
              type: 'string',
              format: 'date',
              example: '2025-02-07',
            },
          },
        },
      },
      403: {
        description: 'Unauthorized request (non-Muthawwif user)',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example:
              'Unauthorized: Only Muthawwif users can remove availability',
          },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to remove availability' },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = deleteAvailabilitySchema
