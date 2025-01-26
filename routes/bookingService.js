const db = require('../db') // Assuming db is configured using mysql2
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const createBookingSchema = require('../schemas/createBookingSchema')
const { sendBookingConfirmationEmail } = require('../utils/sendEmailCustomer') // Import the email function

module.exports = async function (fastify, opts) {
  fastify.post(
    '/booking',
    { preHandler: verifyToken, ...createBookingSchema },
    async (request, reply) => {
      const { service_id, availability_ids, number_companion } = request.body
      const userId = request.user.id

      let connection

      try {
        connection = await db.getConnection()
        await connection.beginTransaction()

        // Validate user type and get full_name
        const [userResult] = await connection.query(
          'SELECT type, email_address AS email, full_name FROM user WHERE id = ?',
          [userId]
        )
        const user = userResult[0]
        if (!user || user.type !== 'customer') {
          throw new Error(
            'Unauthorized: Only customer users can create bookings'
          )
        }

        const customerEmail = user.email
        const customerName = user.full_name || 'Customer' // Fallback to "Customer" if full_name is NULL
        if (!customerEmail) {
          throw new Error('Customer email is missing or invalid.')
        }

        // Fetch muthawwif details
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

        const [muthawwifResult] = await connection.query(
          'SELECT email_address AS email, full_name AS name, mobile_number AS mobile FROM user WHERE id = ?',
          [muthawwifUserId]
        )
        const muthawwif = muthawwifResult[0]

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

        if (validAvailabilityIds.length === 0) {
          console.warn(
            'All requested dates are already booked:',
            availabilityResults
          )
          return reply.status(200).send({
            message:
              'All requested dates were already booked, but no booking was created.',
            availabilityResults,
          })
        }

        const totalAmount = dailyRate * validAvailabilityIds.length

        // Create booking entry
        const [bookingResult] = await connection.query(
          `INSERT INTO booking (user_id, booking_status, number_companion, total_amount) 
           VALUES (?, ?, ?, ?)`,
          [userId, 'pending', number_companion || 1, totalAmount]
        )
        const bookingId = bookingResult.insertId

        // Insert booking details
        const bookingDetailsPlaceholders = validAvailabilityIds
          .map(() => '(?, ?, ?, ?, ?, ?)')
          .join(', ')
        const bookingDetailsParams = validAvailabilityIds.flatMap((id) => [
          bookingId,
          service_id,
          id,
          serviceType,
          dailyRate,
          'pending',
        ])
        await connection.query(
          `INSERT INTO booking_details (booking_id, service_id, availability_id, service_type, daily_rate, booking_status) 
           VALUES ${bookingDetailsPlaceholders}`,
          bookingDetailsParams
        )

        // Update availability
        await connection.query(
          `UPDATE muthawwif_availability SET is_booked = TRUE WHERE id IN (${placeholders})`,
          validAvailabilityIds
        )

        await connection.commit()

        // Prepare email details
        const bookingDates = validAvailability.map(
          (row) => new Date(row.available_date).toDateString() // Convert to "Wed Jan 22 2025"
        )

        // Call the separate email function
        await sendBookingConfirmationEmail({
          customerEmail,
          customerName,
          serviceType,
          muthawwifName: muthawwif.name,
          muthawwifEmail: muthawwif.email,
          muthawwifMobile: muthawwif.mobile,
          totalAmount,
          bookingDates,
        })

        return reply.send({
          message: 'Booking created successfully and email sent',
          totalBookings: validAvailabilityIds.length,
          bookingDates,
        })
      } catch (error) {
        if (connection) await connection.rollback()
        console.error('Error:', error)
        return reply
          .status(500)
          .send({ error: error.message || 'Failed to create booking' })
      } finally {
        if (connection) connection.release()
      }
    }
  )
}
