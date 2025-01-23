const muthawwifListSchema = {
  schema: {
    description:
      'Fetch the list of Muthawwif services along with their availability, bio, and experience',
    tags: ['Muthawwif Services'],
    // security: [{ BearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          example: 1,
        },
        limit: {
          type: 'integer',
          description: 'Number of results per page',
          example: 10,
        },
        sort: {
          type: 'string',
          enum: ['name', 'rate'],
          description: 'Sort by name or rate',
          example: 'name',
        },
        nationality: {
          type: 'string',
          description: 'Filter by nationality',
          example: 'American',
        },
      },
      required: [],
    },
    response: {
      200: {
        description: 'List of Muthawwif services and their availabilities',
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user_id: { type: 'integer', example: 8 },
                full_name: { type: 'string', example: 'John Doe' },
                nationality: { type: 'string', example: 'American' },
                photo_url: {
                  type: 'string',
                  format: 'url',
                  example: 'https://example.com/john.jpg',
                },
                bio: {
                  type: 'string',
                  description: 'Short biography of the Muthawwif',
                  example:
                    'Experienced guide with over 10 years of service in Makkah and Madinah.',
                },
                experience: {
                  type: 'integer',
                  description: 'Years of experience',
                  example: 10,
                },
                services: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      service_id: { type: 'integer', example: 1 },
                      service_type: {
                        type: 'string',
                        enum: ['umrah', 'city_tour', 'umrah_city_tour'],
                        example: 'umrah',
                      },
                      daily_rate: { type: 'string', example: '150.50' },
                      city: { type: 'string', example: 'Makkah' },
                    },
                  },
                },
                availabilities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      availability_id: { type: 'integer', example: 1 },
                      availability_date: {
                        type: 'string',
                        format: 'date',
                        example: '2025-01-26',
                      },
                    },
                  },
                },
              },
            },
          },
          totalEntries: { type: 'integer', example: 1 },
          currentPage: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 1 },
        },
      },
      401: {
        description: 'Unauthorized request',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Failed to fetch Muthawwif services',
          },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = muthawwifListSchema
