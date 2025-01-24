const db = require('../db')
const muthawwifListSchema = require('../schemas/muthawwifListSchema')

module.exports = async function (fastify, opts) {
  fastify.get(
    '/muthawwif-services',
    { ...muthawwifListSchema },
    async (request, reply) => {
      const {
        page = 1,
        limit = 10,
        sort = 'name',
        nationality,
        service_type,
        startDate,
        endDate,
      } = request.query
      const offset = (page - 1) * limit

      try {
        // Base condition for filters
        const filters = []
        const params = []

        if (nationality) {
          filters.push('u.nationality = ?')
          params.push(nationality)
        }

        if (service_type) {
          filters.push('ms.service_type = ?')
          params.push(service_type)
        }

        let dateFilter = ''
        if (startDate && endDate) {
          dateFilter = `
            AND ma.user_id IN (
              SELECT user_id
              FROM muthawwif_availability
              WHERE available_date BETWEEN ? AND ?
              AND is_booked = FALSE
              GROUP BY user_id
              HAVING COUNT(DISTINCT available_date) = DATEDIFF(?, ?) + 1
            )
          `
          params.push(startDate, endDate, endDate, startDate)
        } else if (startDate) {
          dateFilter = `
            AND ma.user_id IN (
              SELECT user_id
              FROM muthawwif_availability
              WHERE available_date = ?
              AND is_booked = FALSE
            )
          `
          params.push(startDate)
        }

        // Main query to fetch Muthawwif users with their services and availabilities
        const queryMuthawwifUsers = `
          SELECT 
            u.id AS user_id, 
            u.full_name, 
            u.nationality, 
            u.photo_url, 
            u.bio,
            u.experience
          FROM user u
          INNER JOIN muthawwif_service ms ON ms.user_id = u.id
          INNER JOIN muthawwif_availability ma ON ma.user_id = u.id AND ma.is_booked = FALSE
          WHERE u.type = 'muthawwif'
          ${filters.length ? 'AND ' + filters.join(' AND ') : ''}
          ${dateFilter}
          GROUP BY u.id
          ORDER BY ${sort === 'rate' ? 'ms.daily_rate' : 'u.full_name'} ASC
          LIMIT ? OFFSET ?
        `
        params.push(parseInt(limit), parseInt(offset))

        const [muthawwifRows] = await db.query(queryMuthawwifUsers, params)

        // If no users found, return an empty response
        if (muthawwifRows.length === 0) {
          return reply.send({
            data: [],
            totalEntries: 0,
            currentPage: parseInt(page),
            totalPages: 0,
          })
        }

        // Fetch services for the Muthawwif users
        const userIds = muthawwifRows.map((row) => row.user_id)
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
            user_id: userId,
            full_name: muthawwif.full_name,
            nationality: muthawwif.nationality,
            photo_url: muthawwif.photo_url,
            bio: muthawwif.bio,
            experience: muthawwif.experience,
            services,
            availabilities,
          }
        })

        // Count total entries for pagination
        const countQuery = `
          SELECT COUNT(DISTINCT u.id) AS totalEntries
          FROM user u
          INNER JOIN muthawwif_service ms ON ms.user_id = u.id
          INNER JOIN muthawwif_availability ma ON ma.user_id = u.id AND ma.is_booked = FALSE
          WHERE u.type = 'muthawwif'
          ${filters.length ? 'AND ' + filters.join(' AND ') : ''}
          ${dateFilter}
        `
        const [countResult] = await db.query(countQuery, params.slice(0, -2)) // Remove pagination params
        const totalEntries = countResult[0]?.totalEntries || 0

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
