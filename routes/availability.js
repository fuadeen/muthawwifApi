const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const muthawwifAvailabilitySchema = require('../schemas/muthawwifAvailabilitySchema')

module.exports = async function (fastify, opts) {
  fastify.post(
    '/muthawwif',
    { preHandler: verifyToken, ...muthawwifAvailabilitySchema },
    async (request, reply) => {
      const {
        startDate,
        endDate,
        excludeDays = [],
        excludeDates = [],
      } = request.body
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

        // Validate date range
        const nowUTC = new Date().toISOString().split('T')[0] // Today's date in UTC (YYYY-MM-DD format)
        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
          return reply.status(400).send({ error: 'Invalid date range' })
        }

        // Ensure startDate and endDate are today or later
        if (
          new Date(startDate) < new Date(nowUTC) ||
          new Date(endDate) < new Date(nowUTC)
        ) {
          return reply.status(400).send({
            error:
              'Dates must not include past dates (only today or future dates are allowed)',
          })
        }

        // Validate excludeDates (must not contain past dates)
        const invalidExcludeDates = excludeDates.filter(
          (date) => new Date(date) < new Date(nowUTC)
        )
        if (invalidExcludeDates.length > 0) {
          return reply.status(400).send({
            error: 'Exclude dates cannot include past dates',
            invalidDates: invalidExcludeDates,
          })
        }

        // Parse excludeDates into a Set for fast lookup
        const excludeDatesSet = new Set(excludeDates)

        // Generate dates for the range
        const start = new Date(startDate)
        const end = new Date(endDate)
        const dates = []
        for (let dt = start; dt <= end; dt.setUTCDate(dt.getUTCDate() + 1)) {
          const currentDateUTC = new Date(dt).toISOString().split('T')[0] // Format: YYYY-MM-DD

          // Exclude dates based on excludeDays or excludeDates
          if (
            !excludeDays.includes(new Date(currentDateUTC).getUTCDay()) &&
            !excludeDatesSet.has(currentDateUTC)
          ) {
            dates.push(currentDateUTC)
          }
        }

        // Insert dates into the database (skip duplicates with INSERT IGNORE)
        const placeholders = dates.map(() => '(?, ?, FALSE)').join(', ')
        const params = dates.flatMap((date) => [userId, date])

        await db.query(
          `INSERT IGNORE INTO muthawwif_availability (user_id, available_date, is_booked) VALUES ${placeholders}`,
          params
        )

        reply.send({
          message: 'Availability updated successfully',
          totalDatesAdded: dates.length,
        })
      } catch (error) {
        console.error('Error updating availability:', error)
        reply
          .status(500)
          .send({ error: 'Failed to update availability', details: error })
      }
    }
  )
}
