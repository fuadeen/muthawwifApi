const muthawwifAvailabilitySchema = {
  schema: {
    description: 'Update Muthawwif availability in bulk',
    tags: ['Availability'],
    security: [
      {
        BearerAuth: [],
      },
    ],
    body: {
      type: 'object',
      required: ['startDate', 'endDate'],
      properties: {
        startDate: {
          type: 'string',
          format: 'date',
          description:
            'The start date of the availability range (YYYY-MM-DD). Must be a future date.',
          example: '2025-01-01',
        },
        endDate: {
          type: 'string',
          format: 'date',
          description:
            'The end date of the availability range (YYYY-MM-DD). Must be after the startDate.',
          example: '2025-12-31',
        },
        excludeDays: {
          type: 'array',
          items: {
            type: 'integer',
            minimum: 0,
            maximum: 6,
            description: 'Days of the week to exclude (0=Sunday, 6=Saturday).',
          },
          description: 'Array of weekdays to exclude from availability.',
          example: [5, 6],
        },
        excludeDates: {
          type: 'array',
          items: {
            type: 'string',
            format: 'date',
            description:
              'Specific dates to exclude from availability (YYYY-MM-DD).',
          },
          description: 'Array of specific dates to exclude from availability.',
          example: ['2025-02-05', '2025-07-04'],
        },
      },
    },
    response: {
      200: {
        description: 'Availability successfully updated',
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Availability updated successfully',
          },
          totalDatesAdded: { type: 'integer', example: 365 },
        },
      },
      400: {
        description: 'Invalid input or no valid dates to add',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Exclude dates cannot include past dates.',
          },
          invalidDates: {
            type: 'array',
            items: {
              type: 'string',
              format: 'date',
            },
            example: ['2024-12-01', '2024-11-30'],
          },
        },
      },
      403: {
        description: 'Unauthorized access',
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
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to update availability' },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = muthawwifAvailabilitySchema
