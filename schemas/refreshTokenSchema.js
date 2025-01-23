const refreshTokenSchema = {
  schema: {
    description: 'Generate a new access token using a refresh token.',
    tags: ['Auth'], // Swagger tag for grouping
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          description: 'The refresh token provided during login.',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
    response: {
      200: {
        description: 'Successfully generated a new access token.',
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'The newly generated access token.',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      401: {
        description: 'Invalid or expired refresh token.',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Invalid refresh token',
          },
        },
      },
    },
  },
}

module.exports = refreshTokenSchema
