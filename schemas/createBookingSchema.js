const createBookingSchema = {
  schema: {
    description:
      'Create a booking for selected Muthawwif availability slots and service',
    tags: ['Bookings'],
    security: [{ BearerAuth: [] }],
    body: {
      type: 'object',
      required: ['availability_ids', 'service_id', 'number_companion'],
      properties: {
        availability_ids: {
          type: 'array',
          description: 'List of availability slot IDs to book',
          items: {
            type: 'integer',
            example: 10,
          },
        },
        service_id: {
          type: 'integer',
          description: 'The ID of the selected service',
          example: 5,
        },
        number_companion: {
          type: 'integer',
          description: 'The total number of people (including the customer)',
          example: 4,
        },
      },
    },
    response: {
      200: {
        description: 'Successful booking creation',
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Booking created successfully' },
          totalBookings: { type: 'integer', example: 2 },
          bookingDates: {
            type: 'array',
            description: 'Dates of the booked availability slots',
            items: { type: 'string', format: 'date', example: '2025-02-10' },
          },
        },
      },
      400: {
        description: 'Bad Request',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Some availability slots are already booked',
          },
          bookedIds: {
            type: 'array',
            items: { type: 'integer', example: 10 },
          },
        },
      },
      403: {
        description: 'Unauthorized Request',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Unauthorized: Only customers can create bookings',
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to create booking' },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = createBookingSchema
