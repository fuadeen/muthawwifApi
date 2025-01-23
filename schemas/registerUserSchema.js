const registerUserSchema = {
  schema: {
    description: 'Register a new user (Muthawwif or Customer)',
    tags: ['Users'],
    body: {
      type: 'object',
      required: ['username', 'password', 'type'],
      properties: {
        username: {
          type: 'string',
          description: 'Unique username for the user',
          example: 'johndoe',
        },
        password: {
          type: 'string',
          description:
            'Password must include at least 8 characters, one letter, one number, and one special character (!@#$%^&*)',
          example: 'Secure@123',
        },
        type: {
          type: 'string',
          description: 'User type: muthawwif or customer',
          enum: ['muthawwif', 'customer'],
          example: 'muthawwif',
        },
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
        photo_url: {
          type: 'string',
          description: 'URL for the user’s photo',
          example: 'https://example.com/profile.jpg',
        },
        passport_scan_url: {
          type: 'string',
          description: 'URL for the scanned passport copy',
          example: 'https://example.com/passport_scan.jpg',
        },
        experience: {
          type: 'integer',
          description: 'Years of experience (relevant for Muthawwif)',
          example: 5,
        },
        bio: {
          type: 'string',
          description: 'Short biography of the user',
          example: 'Experienced Muthawwif guide with expertise in Umrah tours.',
        },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        description: 'User created successfully',
        type: 'object',
        properties: {
          message: { type: 'string', example: 'User created successfully' },
          userId: { type: 'integer', example: 42 },
        },
      },
      400: {
        description: 'Validation error',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Username, password, and type are required',
          },
        },
      },
      500: {
        description: 'Server error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to create user' },
          details: { type: 'object' },
        },
      },
    },
  },
}

module.exports = registerUserSchema
