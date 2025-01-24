const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const getMuthawwifAvailabilitySchema = require('../schemas/getMuthawwifAvailabilitySchema')

module.exports = async function (fastify, opts) {
  // Get Muthawwif availability
  fastify.get(
    '/muthawwif',
    { preHandler: verifyToken, ...getMuthawwifAvailabilitySchema },
    async (request, reply) => {
      const userId = request.user.id // Get user ID from the verified token
      const { startDate, endDate } = request.query // Optional filters for date range

      try {
        // Validate user type
        const [userResult] = await db.query(
          'SELECT type FROM user WHERE id = ?',
          [userId]
        )
        const user = userResult[0]
        if (!user || user.type !== 'muthawwif') {
          return reply.status(403).send({
            error: 'Unauthorized: Only Muthawwif users can view availability',
          })
        }

        // Build the query
        let query =
          'SELECT id, available_date, is_booked FROM muthawwif_availability WHERE user_id = ?'
        const params = [userId]

        if (startDate) {
          query += ' AND available_date >= ?'
          params.push(startDate)
        }

        if (endDate) {
          query += ' AND available_date <= ?'
          params.push(endDate)
        }

        // Execute the query
        const [rows] = await db.query(query, params)

        // Structure the response
        const availableDates = rows
          .filter((row) => !row.is_booked)
          .map((row) => ({ id: row.id, date: row.available_date }))
        const bookedDates = rows
          .filter((row) => row.is_booked)
          .map((row) => ({ id: row.id, date: row.available_date }))

        // Send the response
        return reply.send({
          availableDates,
          bookedDates,
        })
      } catch (error) {
        // Handle errors and ensure only one response is sent
        return reply
          .status(500)
          .send({ error: 'Failed to fetch availability', details: error })
      }
    }
  )
}
