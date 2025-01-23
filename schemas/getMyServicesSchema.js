const getMyServicesSchema = {
  schema: {
    description: 'Get services belonging to the logged-in user',
    tags: ['Services'],
    querystring: {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          example: 1,
          default: 1,
        },
        limit: {
          type: 'integer',
          description: 'Number of items per page',
          example: 10,
          default: 10,
        },
        sort: {
          type: 'string',
          description: 'Sorting option for services',
          enum: ['lowest_rate', 'highest_rate'],
          example: 'lowest_rate',
        },
      },
    },
    response: {
      200: {
        description: 'List of services belonging to the logged-in user',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'Service ID', example: 1 },
                daily_rate: {
                  type: 'number',
                  format: 'float',
                  description: 'Daily rate for the service',
                  example: 150.0,
                },
                city: {
                  type: 'string',
                  description: 'City where the service is offered',
                  example: 'Makkah',
                },
                service_type: {
                  type: 'string',
                  description: 'Type of service',
                  enum: ['umrah', 'city_tour', 'umrah_city_tour'],
                  example: 'umrah',
                },
              },
            },
          },
          totalEntries: {
            type: 'integer',
            description: 'Total number of services for the user',
            example: 15,
          },
          currentPage: {
            type: 'integer',
            description: 'Current page number',
            example: 1,
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 2,
          },
        },
      },
      500: {
        description: 'Failed to fetch services',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to fetch your services' },
          details: { type: 'object' },
        },
      },
    },
  },
}

module.exports = getMyServicesSchema
