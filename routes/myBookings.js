const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware')
const getMyBookingsSchema = require('../schemas/getMyBookingsSchema')

module.exports = async function (fastify, opts) {
  fastify.get(
    '/my-bookings',
    { preHandler: verifyToken, ...getMyBookingsSchema },
    async (request, reply) => {
      const userId = request.user.id
      const userType = request.user.type
      let { page, limit } = request.query

      // Validate and normalize pagination parameters
      page = parseInt(page, 10)
      limit = parseInt(limit, 10)
      if (isNaN(page) || page < 1) page = 1
      if (isNaN(limit) || limit < 1) limit = 10

      const offset = (page - 1) * limit

      try {
        if (userType !== 'customer') {
          return reply.status(403).send({
            error: 'Unauthorized: Only customer users can access this endpoint',
          })
        }

        // Count total bookings for pagination
        const countQuery = `
          SELECT COUNT(DISTINCT b.id) AS totalBookings
          FROM booking b
          WHERE b.user_id = ?
        `
        const [countResult] = await db.query(countQuery, [userId])
        const totalBookings = countResult[0]?.totalBookings || 0

        // Calculate total pages and validate the requested page
        const totalPages = Math.ceil(totalBookings / limit)

        if (totalBookings === 0 || page > totalPages) {
          return reply.send({
            data: [],
            pagination: {
              currentPage: page,
              totalPages,
              totalBookings,
            },
          })
        }

        // Fetch bookings with pagination
        const bookingQuery = `
          SELECT 
            b.id AS booking_id,
            b.booking_status,
            b.number_companion,
            b.total_amount,
            b.created_at,
            GROUP_CONCAT(DISTINCT DATE(ma.available_date) ORDER BY ma.available_date ASC) AS booking_dates,
            u.full_name AS muthawwif_name,
            u.mobile_number,
            u.whatsapp_number
          FROM booking b
          INNER JOIN booking_details bd ON bd.booking_id = b.id
          INNER JOIN muthawwif_availability ma ON ma.id = bd.availability_id
          INNER JOIN muthawwif_service ms ON ms.id = bd.service_id
          INNER JOIN user u ON u.id = ms.user_id
          WHERE b.user_id = ?
          GROUP BY b.id, b.booking_status, b.number_companion, b.total_amount, b.created_at, u.full_name, u.mobile_number, u.whatsapp_number
          ORDER BY b.created_at DESC
          LIMIT ? OFFSET ?
        `
        const [bookings] = await db.query(bookingQuery, [userId, limit, offset])

        reply.send({
          data: bookings.map((booking) => ({
            booking_id: booking.booking_id,
            booking_status: booking.booking_status,
            number_companion: booking.number_companion,
            total_amount: parseFloat(booking.total_amount),
            created_at: booking.created_at,
            booking_dates: booking.booking_dates
              ? booking.booking_dates.split(',')
              : [],
            muthawwif_name: booking.muthawwif_name,
            mobile_number: booking.mobile_number,
            whatsapp_number: booking.whatsapp_number,
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalBookings,
          },
        })
      } catch (error) {
        console.error('Error:', error)
        reply.status(500).send({
          error: 'Failed to fetch booking list',
          details: error.message,
        })
      }
    }
  )
}
