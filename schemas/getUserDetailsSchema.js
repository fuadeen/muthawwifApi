const getUserDetailsSchema = {
  schema: {
    description: 'Get details of the currently authenticated user',
    tags: ['Users'],
    response: {
      200: {
        description: 'Successfully retrieved user details',
        type: 'object',
        properties: {
          full_name: {
            type: 'string',
            description: 'Full name of the user',
            example: 'John Doe',
          },
          passport_number: {
            type: 'string',
            description: 'Passport number of the user',
            example: 'A12345678',
          },
          mobile_number: {
            type: 'string',
            description: 'Mobile number of the user',
            example: '+966501234567',
          },
          whatsapp_number: {
            type: 'string',
            description: 'WhatsApp number of the user',
            example: '+966501234567',
          },
          email_address: {
            type: 'string',
            format: 'email',
            description: 'Email address of the user',
            example: 'johndoe@example.com',
          },
          nationality: {
            type: 'string',
            description: 'Nationality of the user',
            example: 'Saudi Arabian',
          },
        },
      },
      401: {
        description: 'Unauthorized - Missing or invalid token',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Unauthorized',
          },
        },
      },
      404: {
        description: 'User not found',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'User not found',
          },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Internal server error',
          },
          details: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
  },
}

module.exports = getUserDetailsSchema
