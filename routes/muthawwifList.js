const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const muthawwifListSchema = require('../schemas/muthawwifListSchema')

module.exports = async function (fastify, opts) {
  fastify.get(
    '/muthawwif-services',
    { ...muthawwifListSchema },
    async (request, reply) => {
      const { page = 1, limit = 10, sort = 'name', nationality } = request.query
      const offset = (page - 1) * limit

      try {
        // Base condition for nationality filter
        const nationalityFilter = nationality ? `AND u.nationality = ?` : ``

        const nationalityParams = nationality ? [nationality] : []

        // Fetch Muthawwif users with their availabilities
        const queryMuthawwifUsers = `
          SELECT 
            u.id AS user_id, 
            u.full_name, 
            u.nationality, 
            u.photo_url,
            u.bio, -- Muthawwif bio
            u.experience -- Muthawwif experience
          FROM user u
          INNER JOIN muthawwif_availability ma 
            ON ma.user_id = u.id AND ma.is_booked = FALSE
          WHERE u.type = 'muthawwif'
          ${nationalityFilter}
          GROUP BY u.id
          ORDER BY ${sort === 'rate' ? 'u.full_name' : 'u.full_name'} ASC
          LIMIT ? OFFSET ?
        `
        const params = [...nationalityParams, parseInt(limit), parseInt(offset)]
        const [muthawwifRows] = await db.query(queryMuthawwifUsers, params)

        // Get user IDs from the fetched rows
        const userIds = muthawwifRows.map((row) => row.user_id)
        if (userIds.length === 0) {
          return reply.send({
            data: [],
            totalEntries: 0,
            currentPage: parseInt(page),
            totalPages: 0,
          })
        }

        // Fetch services for the Muthawwif users
        const queryServices = `
          SELECT 
            ms.user_id, 
            ms.id AS service_id, 
            ms.service_type, 
            ms.daily_rate, 
            ms.city
          FROM muthawwif_service ms
          WHERE ms.user_id IN (${userIds.map(() => '?').join(', ')})
        `
        const [serviceRows] = await db.query(queryServices, userIds)

        // Fetch availabilities for the Muthawwif users
        const queryAvailabilities = `
          SELECT 
            ma.user_id, 
            ma.id AS availability_id, 
            DATE(ma.available_date) AS availability_date
          FROM muthawwif_availability ma
          WHERE ma.user_id IN (${userIds.map(() => '?').join(', ')}) 
          AND ma.is_booked = FALSE
        `
        const [availabilityRows] = await db.query(queryAvailabilities, userIds)

        // Aggregate data into the desired structure
        const data = muthawwifRows.map((muthawwif) => {
          const userId = muthawwif.user_id
          const services = serviceRows
            .filter((service) => service.user_id === userId)
            .map((service) => ({
              service_id: service.service_id,
              service_type: service.service_type,
              daily_rate: service.daily_rate,
              city: service.city,
            }))

          const availabilities = availabilityRows
            .filter((availability) => availability.user_id === userId)
            .map((availability) => ({
              availability_id: availability.availability_id,
              availability_date: availability.availability_date,
            }))

          return {
            user_id: muthawwif.user_id,
            full_name: muthawwif.full_name,
            nationality: muthawwif.nationality,
            photo_url: muthawwif.photo_url,
            bio: muthawwif.bio, // Include bio
            experience: muthawwif.experience, // Include experience
            services,
            availabilities,
          }
        })

        // Count total entries for pagination (only Muthawwif users with availabilities)
        const countQuery = `
          SELECT COUNT(DISTINCT u.id) AS totalEntries
          FROM user u
          INNER JOIN muthawwif_availability ma 
            ON ma.user_id = u.id AND ma.is_booked = FALSE
          WHERE u.type = 'muthawwif'
          ${nationalityFilter}
        `
        const [countResult] = await db.query(countQuery, nationalityParams)
        const totalEntries = countResult[0].totalEntries

        reply.send({
          data,
          totalEntries,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalEntries / limit),
        })
      } catch (error) {
        console.error('Error:', error)
        reply.status(500).send({
          error: 'Failed to fetch Muthawwif services',
          details: error.message,
        })
      }
    }
  )
}
