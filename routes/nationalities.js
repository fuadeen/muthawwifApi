const db = require('../db')

module.exports = async function (fastify, opts) {
  fastify.get('/nationalities', async (request, reply) => {
    try {
      const [rows] = await db.query(
        'SELECT DISTINCT nationality FROM user WHERE nationality IS NOT NULL'
      )
      reply.send(rows.map((row) => row.nationality))
    } catch (err) {
      reply
        .status(500)
        .send({ error: 'Failed to fetch nationalities', details: err })
    }
  })
}
