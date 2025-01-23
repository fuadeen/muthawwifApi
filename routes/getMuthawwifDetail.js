const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const muthawwifDetailSchema = require('../schemas/muthawwifDetailSchema')

module.exports = async function (fastify, opts) {
  fastify.get(
    '/muthawwif-services/:muthawwifId',
    { ...muthawwifDetailSchema },
    async (request, reply) => {
      const { muthawwifId } = request.params

      try {
        // Fetch Muthawwif details
        const queryMuthawwif = `
        SELECT 
          u.id AS user_id, 
          u.full_name, 
          u.nationality, 
          u.photo_url, 
          u.bio, 
          u.experience
        FROM user u
        WHERE u.id = ? AND u.type = 'muthawwif'
      `
        const [muthawwifRows] = await db.query(queryMuthawwif, [muthawwifId])

        if (muthawwifRows.length === 0) {
          return reply.status(404).send({ error: 'Muthawwif not found' })
        }

        const muthawwif = muthawwifRows[0]

        // Fetch Muthawwif services
        const queryServices = `
        SELECT 
          ms.id AS service_id, 
          ms.service_type, 
          ms.daily_rate, 
          ms.city
        FROM muthawwif_service ms
        WHERE ms.user_id = ?
      `
        const [serviceRows] = await db.query(queryServices, [muthawwifId])

        // Fetch Muthawwif availabilities
        const queryAvailabilities = `
        SELECT 
          ma.id AS availability_id, 
          DATE(ma.available_date) AS availability_date
        FROM muthawwif_availability ma
        WHERE ma.user_id = ? AND ma.is_booked = FALSE
      `
        const [availabilityRows] = await db.query(queryAvailabilities, [
          muthawwifId,
        ])

        // Construct response
        const response = {
          user_id: muthawwif.user_id,
          full_name: muthawwif.full_name,
          nationality: muthawwif.nationality,
          photo_url: muthawwif.photo_url,
          bio: muthawwif.bio,
          experience: muthawwif.experience,
          services: serviceRows.map((service) => ({
            service_id: service.service_id,
            service_type: service.service_type,
            daily_rate: service.daily_rate,
            city: service.city,
          })),
          availabilities: availabilityRows.map((availability) => ({
            availability_id: availability.availability_id,
            availability_date: availability.availability_date,
          })),
        }

        reply.send(response)
      } catch (error) {
        console.error('Error:', error)
        reply.status(500).send({
          error: 'Failed to fetch Muthawwif details',
          details: error.message,
        })
      }
    }
  )
}
