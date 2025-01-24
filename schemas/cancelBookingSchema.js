const cancelBookingSchema = {
  schema: {
    description:
      'Cancel a booking for the specified booking ID. The booking can only be cancelled if its status is still pending.',
    tags: ['Bookings'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      required: ['bookingId'],
      properties: {
        bookingId: {
          type: 'integer',
          description: 'The ID of the booking to cancel',
          example: 123,
        },
      },
    },
    response: {
      200: {
        description: 'Successful booking cancellation',
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Booking cancelled successfully',
          },
        },
      },
      400: {
        description: 'Bad Request',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example:
              'Cannot cancel booking: Booking is no longer in pending status',
          },
        },
      },
      403: {
        description: 'Unauthorized Request',
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Booking not found or unauthorized access',
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Failed to cancel booking' },
          details: { type: 'string', example: 'Database connection error' },
        },
      },
    },
  },
}

module.exports = cancelBookingSchema
