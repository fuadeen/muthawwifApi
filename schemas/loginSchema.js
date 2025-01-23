const loginSchema = {
  description: 'Login a user with username and password',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', description: 'User’s username' },
      password: { type: 'string', description: 'User’s password' },
    },
  },
  response: {
    200: {
      description: 'Successful login',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI...' },
        accessTokenExpiry: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-25T12:34:56.000Z',
          description: 'Access token expiration time (ISO 8601 format)',
        },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI...' },
        refreshTokenExpiry: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-26T12:34:56.000Z',
          description: 'Refresh token expiration time (ISO 8601 format)',
        },
        user: {
          type: 'object',
          description: 'User details',
          properties: {
            id: { type: 'integer', example: 1, description: 'User ID' },
            username: {
              type: 'string',
              example: 'john_doe',
              description: 'User’s username',
            },
            type: {
              type: 'string',
              example: 'muthawwif',
              description: 'Type of the user',
            },
          },
        },
      },
    },
    401: {
      description: 'Unauthorized login attempt',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Invalid username or password' },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Failed to login' },
        details: {
          type: 'string',
          example: 'Error details (e.g., database connection error)',
        },
      },
    },
  },
}

module.exports = loginSchema
