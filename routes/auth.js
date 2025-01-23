const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
const loginSchema = require('../schemas/loginSchema')
const refreshTokenSchema = require('../schemas/refreshTokenSchema')
const logoutSchema = require('../schemas/logoutSchema')

module.exports = async function (fastify) {
  const { JWT_SECRET } = process.env

  // Login endpoint
  fastify.post('/login', { schema: loginSchema }, async (request, reply) => {
    const { username, password } = request.body
    try {
      const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [
        username,
      ])
      const user = rows[0]

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.status(401).send({ error: 'Invalid username or password' })
      }

      // Token expiration times
      const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      const refreshTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day

      // Generate new tokens
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, type: user.type },
        JWT_SECRET,
        { expiresIn: '15m' }
      )
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username, type: user.type },
        JWT_SECRET,
        { expiresIn: '20m' }
      )

      // Store new refresh token and invalidate previous ones
      await db.query(
        'DELETE FROM tokens WHERE user_id = ? AND type = "refresh"',
        [user.id]
      )
      await db.query(
        `INSERT INTO tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)`,
        [user.id, refreshToken, 'refresh', refreshTokenExpiry]
      )

      // Respond with tokens, expirations, and user details
      reply.send({
        message: 'Login successful',
        accessToken,
        accessTokenExpiry: accessTokenExpiry.toISOString(),
        refreshToken,
        refreshTokenExpiry: refreshTokenExpiry.toISOString(),
        user: {
          id: user.id,
          username: user.username,
          type: user.type,
        },
      })
    } catch (error) {
      reply.status(500).send({ error: 'Failed to login', details: error })
    }
  })

  // Refresh token endpoint
  fastify.post(
    '/refresh-token',
    { ...refreshTokenSchema },
    async (req, reply) => {
      const { refreshToken } = req.body
      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET)
        const newAccessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        const newAccessToken = jwt.sign(
          { id: decoded.id, username: decoded.username, type: decoded.type },
          JWT_SECRET,
          { expiresIn: '15m' }
        )

        reply.send({
          accessToken: newAccessToken,
          accessTokenExpiry: newAccessTokenExpiry.toISOString(),
        })
      } catch (err) {
        reply.status(401).send({ error: 'Invalid refresh token' })
      }
    }
  )

  // Logout endpoint
  fastify.post('/logout', { ...logoutSchema }, async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1] // Extract token from Authorization header

    if (!token) {
      return reply.status(400).send({ error: 'No token provided' })
    }

    try {
      const decoded = jwt.decode(token)
      if (!decoded) {
        return reply.status(400).send({ error: 'Invalid token' })
      }

      // Check if the token is already blacklisted
      const [existingToken] = await db.query(
        'SELECT * FROM blacklisted_tokens WHERE token = ?',
        [token]
      )

      if (existingToken.length > 0) {
        return reply.status(400).send({
          error: 'Token already blacklisted',
          message: 'You are already logged out',
        })
      }

      // Blacklist the token
      await db.query(
        'INSERT INTO blacklisted_tokens (token, user_id, blacklisted_at) VALUES (?, ?, ?)',
        [token, decoded.id, new Date()]
      )

      reply.send({ message: 'Logout successful' })
    } catch (err) {
      reply.status(500).send({ error: 'Failed to logout', details: err })
    }
  })
}
