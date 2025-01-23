const logoutSchema = {
  schema: {
    description: 'Logout the user and invalidate the access token.',
    tags: ['Auth'],
    security: [{ BearerAuth: [] }],
    response: {
      200: {
        description: 'Logout successful response.',
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logout successful' },
        },
      },
      400: {
        description: 'Bad request due to missing or invalid token.',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'No token provided' },
        },
      },
      500: {
        description: 'Server error during logout process.',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to logout' },
          details: { type: 'string', example: 'Error details' },
        },
      },
    },
  },
}

module.exports = logoutSchema
