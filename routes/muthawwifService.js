const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware') // Middleware to verify token
const createMuthawwifServiceSchema = require('../schemas/createMuthawwifServiceSchema')
const editMuthawwifServiceSchema = require('../schemas/editMuthawwifServiceSchema')
const deleteMuthawwifServiceSchema = require('../schemas/deleteMuthawwifServiceSchema')
const getMyServicesSchema = require('../schemas/getMyServicesSchema')

module.exports = async function (fastify, opts) {
  // Create a new Muthawwif service
  fastify.post(
    '/my-service',
    {
      preHandler: verifyToken,
      ...createMuthawwifServiceSchema, // Attach the schema
    },
    async (request, reply) => {
      const { daily_rate, city, service_type } = request.body
      const userId = request.user.id // Get the user ID from the verified token

      // Validate input
      if (!daily_rate || !city || !service_type) {
        return reply.status(400).send({
          error: 'Daily rate, city, and service type are required fields',
        })
      }

      try {
        console.log('Received request:', {
          userId,
          daily_rate,
          city,
          service_type,
        })

        // Begin database transaction
        const conn = await db.getConnection() // Use a transaction-enabled connection
        await conn.beginTransaction()

        // Check if the user is of type 'muthawwif'
        const [userResult] = await conn.query(
          'SELECT type FROM user WHERE id = ?',
          [userId]
        )
        const user = userResult[0]

        if (!user || user.type !== 'muthawwif') {
          await conn.rollback() // Rollback transaction
          return reply.status(403).send({
            error:
              'Unauthorized: Only users with type "muthawwif" can create services',
          })
        }

        // Check if the service type already exists for the user
        const [existingService] = await conn.query(
          'SELECT id FROM muthawwif_service WHERE user_id = ? AND service_type = ?',
          [userId, service_type]
        )

        if (existingService.length > 0) {
          await conn.rollback() // Rollback transaction
          return reply.status(400).send({
            error: `Service type "${service_type}" already exists for this user`,
          })
        }

        // Insert new service into the database
        const [result] = await conn.query(
          'INSERT INTO muthawwif_service (user_id, daily_rate, city, service_type) VALUES (?, ?, ?, ?)',
          [userId, daily_rate, city, service_type]
        )

        await conn.commit() // Commit transaction

        reply.send({
          message: 'Service created successfully',
          serviceId: result.insertId,
        })
      } catch (error) {
        console.error('Error during service creation:', error)
        reply
          .status(500)
          .send({ error: 'Failed to create service', details: error })
      }
    }
  ),
    // Edit a specific service
    fastify.put(
      '/my-service/:id',
      { preHandler: verifyToken, ...editMuthawwifServiceSchema },
      async (request, reply) => {
        const { id } = request.params // Get the service ID from the URL
        const { daily_rate, city, service_type } = request.body // Updated fields
        const userId = request.user.id // Get the user ID from the verified token

        try {
          // Check if the service exists and belongs to the user
          const [rows] = await db.query(
            'SELECT * FROM muthawwif_service WHERE id = ? AND user_id = ?',
            [id, userId]
          )
          if (rows.length === 0) {
            return reply
              .status(404)
              .send({ error: 'Service not found or not owned by the user' })
          }

          const service = rows[0]

          // Check if the new service_type already exists for the same user
          if (service_type && service_type !== service.service_type) {
            const [existingServiceType] = await db.query(
              'SELECT * FROM muthawwif_service WHERE user_id = ? AND service_type = ? AND id != ?',
              [userId, service_type, id]
            )

            if (existingServiceType.length > 0) {
              return reply.status(400).send({
                error: 'This service type already exists for the user',
              })
            }
          }

          // Prepare the update fields
          const updates = []
          const params = []

          if (daily_rate !== undefined) {
            updates.push('daily_rate = ?')
            params.push(daily_rate)
          }
          if (city !== undefined) {
            updates.push('city = ?')
            params.push(city)
          }
          if (service_type !== undefined) {
            updates.push('service_type = ?')
            params.push(service_type)
          }

          if (updates.length === 0) {
            return reply
              .status(400)
              .send({ error: 'No fields provided for update' })
          }

          params.push(id, userId)

          // Perform the update
          await db.query(
            `UPDATE muthawwif_service SET ${updates.join(
              ', '
            )} WHERE id = ? AND user_id = ?`,
            params
          )

          reply.send({ message: 'Service updated successfully' })
        } catch (error) {
          reply
            .status(500)
            .send({ error: 'Failed to update service', details: error })
        }
      }
    ),
    // delete a specific service
    fastify.delete(
      '/my-service/:id',
      { preHandler: verifyToken, ...deleteMuthawwifServiceSchema },
      async (request, reply) => {
        const { id } = request.params // Service ID from URL
        const userId = request.user.id // Get the user ID from the verified token

        try {
          // Check if the service exists and belongs to the user
          const [rows] = await db.query(
            'SELECT * FROM muthawwif_service WHERE id = ? AND user_id = ?',
            [id, userId]
          )

          if (rows.length === 0) {
            return reply
              .status(404)
              .send({ error: 'Service not found or not owned by the user' })
          }

          // Delete the service
          await db.query(
            'DELETE FROM muthawwif_service WHERE id = ? AND user_id = ?',
            [id, userId]
          )

          reply.send({ message: 'Service deleted successfully' })
        } catch (error) {
          reply
            .status(500)
            .send({ error: 'Failed to delete service', details: error })
        }
      }
    ),
    // Get services belonging to the logged-in user
    fastify.get(
      '/my-services',
      { preHandler: verifyToken, ...getMyServicesSchema },
      async (request, reply) => {
        const userId = request.user.id // Get the user ID from the verified token
        const { page = 1, limit = 10, sort } = request.query
        const offset = (page - 1) * limit
        let params = [userId]

        let query = `
        SELECT ms.id, ms.daily_rate, ms.city, ms.service_type
        FROM muthawwif_service ms
        WHERE ms.user_id = ?
      `

        // Add sorting
        if (sort === 'lowest_rate') {
          query += ` ORDER BY ms.daily_rate ASC`
        } else if (sort === 'highest_rate') {
          query += ` ORDER BY ms.daily_rate DESC`
        }

        // Add pagination
        query += ` LIMIT ? OFFSET ?`
        params.push(parseInt(limit), parseInt(offset))

        try {
          // Fetch filtered and sorted data
          const [rows] = await db.query(query, params)

          // Count total entries for pagination
          const countQuery = `
          SELECT COUNT(*) as total
          FROM muthawwif_service ms
          WHERE ms.user_id = ?
        `
          const [countResult] = await db.query(countQuery, [userId])
          const totalEntries = countResult[0].total

          reply.send({
            data: rows,
            totalEntries,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEntries / limit),
          })
        } catch (error) {
          reply
            .status(500)
            .send({ error: 'Failed to fetch your services', details: error })
        }
      }
    )
}
