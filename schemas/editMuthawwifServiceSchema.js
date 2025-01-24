const ServiceType = require('../enums/serviceType')

const editMuthawwifServiceSchema = {
  schema: {
    description: 'Edit a specific Muthawwif service by ID',
    tags: ['Services'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'integer',
          description: 'ID of the service to be updated',
          example: 123,
        },
      },
    },
    body: {
      type: 'object',
      properties: {
        daily_rate: {
          type: 'number',
          description: 'Updated daily rate for the service',
          example: 250.0,
        },
        city: {
          type: 'string',
          description: 'Updated city where the service is provided',
          example: 'Mecca',
        },
        service_type: {
          type: 'string',
          description: 'Updated type of service',
          enum: Object.values(ServiceType),
          example: 'umrah',
        },
      },
      additionalProperties: false, // Prevent additional properties
    },
    response: {
      200: {
        description: 'Service updated successfully',
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Service updated successfully' },
        },
      },
      400: {
        description: 'Bad Request',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'No fields provided for update' },
        },
      },
      404: {
        description: 'Service not found',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Service not found or not owned by the user',
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to update service' },
          details: { type: 'object' },
        },
      },
    },
  },
}

module.exports = editMuthawwifServiceSchema
