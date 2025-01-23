const jwt = require('jsonwebtoken')
const db = require('../db') // Assume you are using this for database queries

// Helper function to check if a token is blacklisted
const isTokenBlacklisted = async (token) => {
  const query =
    'SELECT COUNT(*) AS count FROM blacklisted_tokens WHERE token = ?'
  const [result] = await db.query(query, [token])
  return result.count > 0 // Return true if the token exists in the blacklist
}

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] // Extract token from Authorization header

  if (!token) {
    return res.status(401).send({ error: 'Unauthorized: Token not provided' })
  }

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token)
    if (isBlacklisted) {
      return res
        .status(401)
        .send({ error: 'Unauthorized: Token is blacklisted' })
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Attach decoded user info to the request
    next() // Proceed to the next middleware/route
  } catch (err) {
    res.status(401).send({ error: 'Unauthorized: Invalid token' })
  }
}

module.exports = verifyToken
