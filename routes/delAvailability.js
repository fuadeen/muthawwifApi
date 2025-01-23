const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const deleteAvailabilitySchema = require('../schemas/deleteAvailabilitySchema')

module.exports = async function (fastify, opts) {
  fastify.delete(
    '/muthawwif/remove',
    { preHandler: verifyToken, ...deleteAvailabilitySchema },
    async (request, reply) => {
      const userId = request.user.id // Get user ID from the verified token
      const { dates } = request.body // Dates to remove from availability

      try {
        // Validate user type
        const [userResult] = await db.query(
          'SELECT type FROM user WHERE id = ?',
          [userId]
        )
        const user = userResult[0]

        if (!user || user.type !== 'muthawwif') {
          return reply.status(403).send({
            error: 'Unauthorized: Only Muthawwif users can remove availability',
          })
        }

        // Validate request body
        if (!dates || !Array.isArray(dates) || dates.length === 0) {
          return reply.status(400).send({
            error:
              'Invalid request: "dates" must be a non-empty array of valid dates',
          })
        }

        // Normalize input dates to `YYYY-MM-DD` format for consistent comparison
        const normalizedDates = dates.map(
          (date) => new Date(date).toISOString().split('T')[0]
        )

        // Prepare placeholders for SQL query
        const placeholders = normalizedDates.map(() => '?').join(', ')

        // Check if the provided dates exist in the database for this user
        const checkQuery = `
          SELECT 
            DATE(CONVERT_TZ(available_date, '+00:00', '+00:00')) AS available_date,
            is_booked
          FROM muthawwif_availability
          WHERE user_id = ? AND DATE(CONVERT_TZ(available_date, '+00:00', '+00:00')) IN (${placeholders})
        `
        const queryParams = [userId, ...normalizedDates]

        const [existingDates] = await db.query(checkQuery, queryParams)

        // Normalize database dates for comparison
        const existingDateSet = new Set(
          existingDates.map(
            (row) => new Date(row.available_date).toISOString().split('T')[0]
          )
        )

        const bookedDates = existingDates
          .filter((row) => row.is_booked)
          .map(
            (row) => new Date(row.available_date).toISOString().split('T')[0]
          )

        // Identify non-existent dates
        const nonExistentDates = normalizedDates.filter(
          (date) => !existingDateSet.has(date)
        )

        // If there are non-existent dates, return an error
        if (nonExistentDates.length > 0) {
          return reply.status(400).send({
            error: 'Some dates do not exist in your availability',
            nonExistentDates,
          })
        }

        // If there are booked dates, return an error
        if (bookedDates.length > 0) {
          return reply.status(400).send({
            error: 'Cannot remove availability for booked dates',
            bookedDates,
          })
        }

        // Remove the valid dates from the availability table
        const deleteQuery = `
          DELETE FROM muthawwif_availability
          WHERE user_id = ? AND DATE(CONVERT_TZ(available_date, '+00:00', '+00:00')) IN (${placeholders})
        `
        const [result] = await db.query(deleteQuery, queryParams)

        reply.send({
          message: 'Availability removed successfully',
          datesRemoved: result.affectedRows,
        })
      } catch (error) {
        console.error('Error:', error)
        reply
          .status(500)
          .send({ error: 'Failed to remove availability', details: error })
      }
    }
  )
}
