const muthawwifDetailSchema = {
  schema: {
    description:
      'Fetch detailed information about a specific Muthawwif, including bio, experience, services, and availability',
    tags: ['Muthawwif Services'],
    params: {
      type: 'object',
      properties: {
        muthawwifId: {
          type: 'integer',
          description: 'The ID of the Muthawwif',
          example: 1,
        },
      },
      required: ['muthawwifId'],
    },
    response: {
      200: {
        description: 'Detailed information about the Muthawwif',
        type: 'object',
        properties: {
          user_id: { type: 'integer', example: 1 },
          full_name: { type: 'string', example: 'John Doe' },
          nationality: { type: 'string', example: 'American' },
          photo_url: {
            type: 'string',
            format: 'url',
            example: 'https://example.com/john.jpg',
          },
          bio: {
            type: 'string',
            example: 'Experienced Muthawwif with 10 years of service.',
          },
          experience: { type: 'integer', example: 10 },
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
                  example: '2025-01-15',
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Muthawwif not found',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Muthawwif not found' },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Failed to fetch Muthawwif details',
          },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = muthawwifDetailSchema
