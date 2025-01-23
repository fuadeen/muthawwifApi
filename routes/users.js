const bcrypt = require('bcrypt')
const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware')
const registerUserSchema = require('../schemas/registerUserSchema')
const getUserDetailsSchema = require('../schemas/getUserDetailsSchema')

module.exports = async function (fastify, opts) {
  fastify.post(
    '/register-user',
    {
      ...registerUserSchema,
    },
    async (request, reply) => {
      const { username, password, type, full_name, passport_number, ...rest } =
        request.body

      // Validate required fields
      if (!username || !password || !type) {
        return reply
          .status(400)
          .send({ error: 'Username, password, and type are required' })
      }

      // Validate password format
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      if (!passwordRegex.test(password)) {
        return reply.status(400).send({
          error:
            'Password must be at least 8 characters, include one letter, one number, and one special character (!@#$%^&*).',
        })
      }

      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Validate and sanitize dynamic fields in `rest`
        const allowedFields = [
          'mobile_number',
          'whatsapp_number',
          'email_address',
          'nationality',
          'photo_url',
          'passport_scan_url',
          'experience',
          'bio',
        ]
        const filteredRest = Object.keys(rest).reduce((acc, key) => {
          if (allowedFields.includes(key)) {
            acc[key] = rest[key]
          }
          return acc
        }, {})

        const [result] = await db.query(
          `INSERT INTO user (username, password, type, full_name, passport_number, ${Object.keys(
            filteredRest
          ).join(', ')})
          VALUES (?, ?, ?, ?, ?, ${Object.keys(filteredRest)
            .map(() => '?')
            .join(', ')})`,
          [
            username,
            hashedPassword,
            type,
            full_name,
            passport_number,
            ...Object.values(filteredRest),
          ]
        )

        reply.send({
          message: 'User created successfully',
          userId: result.insertId,
        })
      } catch (err) {
        console.error('Error during user registration:', err)
        reply.status(500).send({ error: 'Failed to create user', details: err })
      }
    }
  ),
    fastify.get(
      '/details',
      { preHandler: verifyToken, ...getUserDetailsSchema }, // Add token verification
      async (request, reply) => {
        try {
          const userId = request.user.id // Extract user ID from the verified token

          // Query the database to fetch user details
          const [userDetails] = await db.query(
            `SELECT 
            full_name, 
            passport_number, 
            mobile_number, 
            whatsapp_number, 
            email_address, 
            nationality 
          FROM user 
          WHERE id = ?`,
            [userId]
          )

          if (!userDetails || userDetails.length === 0) {
            return reply.status(404).send({
              error: 'User not found',
            })
          }

          // Return the user details as JSON
          reply.send(userDetails[0])
        } catch (error) {
          console.error('Error fetching user details:', error)
          reply.status(500).send({
            error: 'Internal server error',
            details: error.message,
          })
        }
      }
    )
}
