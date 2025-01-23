const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const addAvailabilitySchema = require('../schemas/addAvailabilitySchema')

module.exports = async function (fastify, opts) {
  fastify.post(
    '/muthawwif/add',
    { preHandler: verifyToken, ...addAvailabilitySchema },
    async (request, reply) => {
      const { startDate, endDate } = request.body
      const userId = request.user.id

      try {
        // Validate user type
        const [userResult] = await db.query(
          'SELECT type FROM user WHERE id = ?',
          [userId]
        )
        const user = userResult[0]
        if (!user || user.type !== 'muthawwif') {
          return reply.status(403).send({
            error: 'Unauthorized: Only Muthawwif users can update availability',
          })
        }

        // Get today's date in UTC format
        const today = new Date()
        const todayUTC = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
          )
        )
          .toISOString()
          .split('T')[0]

        // Validate date range
        const startUTC = new Date(startDate)
        if (!startDate || startUTC < new Date(todayUTC)) {
          return reply.status(400).send({
            error: 'Invalid startDate: Only today or future dates are allowed',
          })
        }

        const endUTC = endDate ? new Date(endDate) : startUTC // Use startDate if endDate is not provided
        if (endDate && endUTC < new Date(todayUTC)) {
          return reply.status(400).send({
            error: 'Invalid endDate: Only today or future dates are allowed',
          })
        }

        if (startUTC > endUTC) {
          return reply.status(400).send({
            error:
              'Invalid date range: startDate must be before or equal to endDate',
          })
        }

        // Generate dates in UTC format
        const placeholders = []
        const params = []
        for (
          let dt = new Date(startUTC);
          dt <= endUTC;
          dt.setUTCDate(dt.getUTCDate() + 1)
        ) {
          const formattedDate = dt.toISOString().split('T')[0] // Format: YYYY-MM-DD
          placeholders.push('(?, ?, FALSE)')
          params.push(userId, formattedDate)
        }

        if (placeholders.length > 0) {
          // Insert dates into the database (skip duplicates with INSERT IGNORE)
          const query = `
            INSERT IGNORE INTO muthawwif_availability (user_id, available_date, is_booked)
            VALUES ${placeholders.join(', ')}
          `
          await db.query(query, params)

          reply.send({
            message: 'Availability added successfully',
            totalDatesAdded: placeholders.length,
          })
        } else {
          reply.status(400).send({
            error: 'No valid dates to add',
          })
        }
      } catch (error) {
        console.error('Error adding availability:', error)
        reply
          .status(500)
          .send({ error: 'Failed to add availability', details: error })
      }
    }
  )
}
