const db = require('../db') // Assuming db is configured using mysql2
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const createBookingSchema = require('../schemas/createBookingSchema')

module.exports = async function (fastify, opts) {
  fastify.post(
    '/booking',
    { preHandler: verifyToken, ...createBookingSchema },
    async (request, reply) => {
      const { service_id, availability_ids, number_companion } = request.body
      const userId = request.user.id

      let connection

      try {
        // Get a connection for transaction
        connection = await db.getConnection()

        // Start transaction
        await connection.beginTransaction()

        // Validate user type
        const [userResult] = await connection.query(
          'SELECT type FROM user WHERE id = ?',
          [userId]
        )
        const user = userResult[0]
        if (!user || user.type !== 'customer') {
          throw new Error(
            'Unauthorized: Only customer users can create bookings'
          )
        }

        // Fetch muthawwif's user_id and daily_rate for the given service_id
        const [serviceResult] = await connection.query(
          'SELECT user_id, daily_rate, service_type FROM muthawwif_service WHERE id = ? FOR UPDATE',
          [service_id]
        )
        if (serviceResult.length === 0) {
          throw new Error('Invalid service_id: No matching service found')
        }
        const {
          user_id: muthawwifUserId,
          daily_rate: dailyRate,
          service_type: serviceType,
        } = serviceResult[0]

        // Validate availability_ids
        const placeholders = availability_ids.map(() => '?').join(', ')
        const [availabilityResults] = await connection.query(
          `SELECT id, DATE(available_date) AS available_date, is_booked 
           FROM muthawwif_availability 
           WHERE user_id = ? AND id IN (${placeholders}) FOR UPDATE`,
          [muthawwifUserId, ...availability_ids]
        )

        const validAvailability = availabilityResults.filter(
          (row) => !row.is_booked
        )
        const validAvailabilityIds = validAvailability.map((row) => row.id)

        // Check for invalid availability_ids
        const invalidAvailabilityIds = availability_ids.filter(
          (id) => !validAvailabilityIds.includes(id)
        )
        if (invalidAvailabilityIds.length > 0) {
          throw new Error(
            'Invalid availability_ids: Some dates are either booked or not associated with the selected service'
          )
        }

        // Ensure no duplicate booking
        const [existingBookingCheck] = await connection.query(
          `SELECT EXISTS (
            SELECT 1 
            FROM booking_details 
            WHERE service_id = ? AND availability_id IN (${placeholders})
          ) AS existsCheck`,
          [service_id, ...validAvailabilityIds]
        )
        if (existingBookingCheck[0].existsCheck) {
          throw new Error('Duplicate booking detected for selected dates')
        }

        // Calculate total amount
        const totalAmount = dailyRate * validAvailabilityIds.length

        // Insert a single booking entry into the main `booking` table
        const [bookingResult] = await connection.query(
          `INSERT INTO booking (user_id, booking_status, number_companion, total_amount) 
           VALUES (?, ?, ?, ?)`,
          [userId, 'pending', number_companion || 1, totalAmount]
        )
        const bookingId = bookingResult.insertId

        // Insert entries into the `booking_details` table with `booking_status`
        const bookingDetailsPlaceholders = validAvailabilityIds
          .map(() => '(?, ?, ?, ?, ?, ?)')
          .join(', ')
        const bookingDetailsParams = validAvailabilityIds.flatMap((id) => [
          bookingId,
          service_id,
          id,
          serviceType,
          dailyRate,
          'pending', // Set booking_status to 'pending'
        ])
        await connection.query(
          `INSERT INTO booking_details (booking_id, service_id, availability_id, service_type, daily_rate, booking_status) 
           VALUES ${bookingDetailsPlaceholders}`,
          bookingDetailsParams
        )

        // Update `is_booked` for the availability table
        await connection.query(
          `UPDATE muthawwif_availability SET is_booked = TRUE WHERE id IN (${placeholders})`,
          validAvailabilityIds
        )

        // Commit transaction
        await connection.commit()

        // Prepare response with booking dates
        const bookingDates = validAvailability.map((row) => row.available_date)
        return reply.send({
          message: 'Booking created successfully',
          totalBookings: validAvailabilityIds.length,
          bookingDates,
        })
      } catch (error) {
        if (connection) await connection.rollback() // Rollback transaction on error
        console.error('Error:', error)
        return reply
          .status(500)
          .send({ error: error.message || 'Failed to create booking' })
      } finally {
        if (connection) connection.release() // Release the connection back to the pool
      }
    }
  )
}
