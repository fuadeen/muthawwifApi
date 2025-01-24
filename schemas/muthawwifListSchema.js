const muthawwifListSchema = {
  schema: {
    description: 'Fetch the list of Muthawwif services with optional filters.',
    tags: ['Muthawwif Services'],
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
          description: 'Sort by name or daily rate',
          example: 'name',
        },
        nationality: {
          type: 'string',
          description: 'Filter by nationality',
          example: 'American',
        },
        service_type: {
          type: 'string',
          enum: ['umrah', 'city_tour', 'umrah_city_tour'],
          description: 'Filter by specific service type',
          example: 'umrah',
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Filter availability starting from this date',
          example: '2025-01-01',
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Filter availability up to this date',
          example: '2025-01-10',
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
                user_id: { type: 'integer', example: 1 },
                full_name: { type: 'string', example: 'John Doe' },
                nationality: { type: 'string', example: 'American' },
                photo_url: { type: 'string', format: 'url', example: '...' },
                bio: { type: 'string', example: 'Experienced Muthawwif' },
                experience: { type: 'integer', example: 10 },
                services: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      service_id: { type: 'integer', example: 2 },
                      service_type: { type: 'string', example: 'umrah' },
                      daily_rate: { type: 'string', example: '150.00' },
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
                        example: '2025-01-01',
                      },
                    },
                  },
                },
              },
            },
          },
          totalEntries: { type: 'integer', example: 10 },
          currentPage: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to fetch data' },
          details: { type: 'string', example: 'Error details' },
        },
      },
    },
  },
}

module.exports = muthawwifListSchema
