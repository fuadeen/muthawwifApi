const jwt = require('jsonwebtoken')
const db = require('../db')

// Helper function to check if a token is blacklisted
const isTokenBlacklisted = async (token) => {
  try {
    const query =
      'SELECT COUNT(*) AS count FROM blacklisted_tokens WHERE token = ?'
    const [result] = await db.query(query, [token])
    return result.count > 0 // Return true if the token exists in the blacklist
  } catch (error) {
    console.error('Error checking token blacklist:', error)
    throw new Error('Database error')
  }
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized access' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token)
    if (isBlacklisted) {
      return res.status(401).send({ error: 'Unauthorized access' })
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Optional: Check token expiry manually
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).send({ error: 'Unauthorized access' })
    }

    req.user = decoded // Attach decoded user info to the request
    next() // Proceed to the next middleware/route
  } catch (err) {
    console.error('Token verification error:', err)
    res.status(401).send({ error: 'Unauthorized access' })
  }
}

module.exports = verifyToken
