const addAvailabilitySchema = {
  schema: {
    description:
      'Add a single date or a date range to the Muthawwif availability calendar.',
    tags: ['Availability'],
    security: [{ BearerAuth: [] }],
    body: {
      type: 'object',
      required: ['startDate'],
      properties: {
        startDate: {
          type: 'string',
          format: 'date',
          description:
            'Start date for the availability (YYYY-MM-DD). Must be today or in the future.',
          example: '2025-03-01',
        },
        endDate: {
          type: 'string',
          format: 'date',
          description:
            'End date for the availability (YYYY-MM-DD). Must be today or in the future. If not provided, startDate is used.',
          example: '2025-03-07',
        },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        description: 'Availability successfully added.',
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Availability added successfully',
          },
          totalDatesAdded: { type: 'number', example: 7 },
        },
      },
      400: {
        description: 'Invalid input or validation error.',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example:
              'Invalid startDate: Only today or future dates are allowed',
          },
        },
      },
      403: {
        description: 'Unauthorized access.',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example:
              'Unauthorized: Only Muthawwif users can update availability',
          },
        },
      },
      500: {
        description: 'Server error.',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to add availability' },
          details: { type: 'object', example: {} },
        },
      },
    },
  },
}

module.exports = addAvailabilitySchema
