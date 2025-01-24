const getMuthawwifAvailabilitySchema = {
  schema: {
    description:
      'Fetch the availability of a Muthawwif based on user ID and optional date range.',
    tags: ['Availability'],
    security: [{ BearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Start date for filtering availability (YYYY-MM-DD)',
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'End date for filtering availability (YYYY-MM-DD)',
        },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        description: 'Availability retrieved successfully',
        type: 'object',
        properties: {
          availableDates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                date: { type: 'string', format: 'date', example: '2025-01-01' },
              },
            },
            description: 'Dates that are available for booking',
          },
          bookedDates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 2 },
                date: { type: 'string', format: 'date', example: '2025-01-02' },
              },
            },
            description: 'Dates that are already booked',
          },
        },
      },
      403: {
        description: 'Unauthorized user',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Unauthorized: Only Muthawwif users can view availability',
          },
        },
      },
      500: {
        description: 'Server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to fetch availability' },
          details: { type: 'string', example: 'Error details' },
        },
      },
    },
  },
}

module.exports = getMuthawwifAvailabilitySchema
