const db = require('../db') // Assuming db is configured using mysql2
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const cancelBookingSchema = require('../schemas/cancelBookingSchema')

module.exports = async function (fastify, opts) {
  fastify.put(
    '/booking/:bookingId/cancel',
    { preHandler: verifyToken, ...cancelBookingSchema },
    async (request, reply) => {
      const { bookingId } = request.params
      const userId = request.user.id // User ID from the verified token
      let connection

      try {
        // Get a connection for transaction
        connection = await db.getConnection()

        // Start transaction
        await connection.beginTransaction()

        // Validate that the booking exists and belongs to the customer
        const [bookingResult] = await connection.query(
          `SELECT booking_status 
           FROM booking 
           WHERE id = ? AND user_id = ? FOR UPDATE`,
          [bookingId, userId]
        )

        if (bookingResult.length === 0) {
          throw new Error('Booking not found or unauthorized access')
        }

        const { booking_status: bookingStatus } = bookingResult[0]

        // Check if the booking is still pending
        if (bookingStatus !== 'pending') {
          throw new Error(
            'Cannot cancel booking: Booking is no longer in pending status'
          )
        }

        // Update the booking status to cancelled in the `booking` table
        await connection.query(
          `UPDATE booking 
           SET booking_status = 'cancelled' 
           WHERE id = ?`,
          [bookingId]
        )

        // Update the booking status in the `booking_details` table
        await connection.query(
          `UPDATE booking_details 
           SET booking_status = 'cancelled' 
           WHERE booking_id = ?`,
          [bookingId]
        )

        // Release the associated availabilities by setting `is_booked` to FALSE
        await connection.query(
          `UPDATE muthawwif_availability 
           SET is_booked = FALSE 
           WHERE id IN (
             SELECT availability_id 
             FROM booking_details 
             WHERE booking_id = ?
           )`,
          [bookingId]
        )

        // Commit transaction
        await connection.commit()

        return reply.send({
          message: 'Booking cancelled successfully',
        })
      } catch (error) {
        if (connection) await connection.rollback() // Rollback transaction on error
        console.error('Error cancelling booking:', error)
        return reply
          .status(500)
          .send({ error: error.message || 'Failed to cancel booking' })
      } finally {
        if (connection) connection.release() // Release the connection back to the pool
      }
    }
  )
}
