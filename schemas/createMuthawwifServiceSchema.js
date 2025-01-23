const createMuthawwifServiceSchema = {
  schema: {
    description: 'Create a new Muthawwif service',
    tags: ['Services'],
    body: {
      type: 'object',
      required: ['daily_rate', 'city', 'service_type'],
      properties: {
        daily_rate: {
          type: 'number',
          minimum: 1,
          description: 'The daily rate for the service',
          example: 200.0,
        },
        city: {
          type: 'string',
          description: 'The city where the service is provided',
          example: 'Mecca',
        },
        service_type: {
          type: 'string',
          enum: ['umrah', 'city_tour', 'umrah_city_tour'],
          description: 'Type of service offered',
          example: 'umrah',
        },
      },
    },
    response: {
      200: {
        description: 'Service created successfully',
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Service created successfully' },
          serviceId: { type: 'number', example: 123 },
        },
      },
      400: {
        description: 'Validation error or duplicate service type',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Daily rate, city, and service type are required fields',
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
              'Unauthorized: Only users with type "muthawwif" can create services',
          },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to create service' },
          details: { type: 'string', example: 'Error details here...' },
        },
      },
    },
  },
}

module.exports = createMuthawwifServiceSchema
