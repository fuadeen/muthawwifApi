const deleteMuthawwifServiceSchema = {
  schema: {
    description: 'Delete a specific Muthawwif service by ID',
    tags: ['Services'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'integer',
          description: 'ID of the service to be deleted',
          example: 123,
        },
      },
    },
    response: {
      200: {
        description: 'Service deleted successfully',
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Service deleted successfully' },
        },
      },
      404: {
        description: 'Service not found or not owned by the user',
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
          error: { type: 'string', example: 'Failed to delete service' },
          details: { type: 'object' },
        },
      },
    },
  },
}

module.exports = deleteMuthawwifServiceSchema
