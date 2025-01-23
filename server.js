const fastify = require('fastify')({ logger: true })
const cron = require('node-cron')
const db = require('./db')
const swagger = require('@fastify/swagger')
const swaggerUi = require('@fastify/swagger-ui')
const fastifyCors = require('@fastify/cors') // Import CORS
require('dotenv').config()
const Ajv = require('ajv')
const addFormats = require('ajv-formats')

// Configure AJV to allow additional keywords and formats
fastify.setValidatorCompiler(({ schema }) => {
  const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    strict: false, // Disable strict mode for additional properties like 'example'
  })
  addFormats(ajv) // Add common formats like "email" and "date"
  ajv.addKeyword('example') // Allow the "example" keyword for Swagger compatibility
  return ajv.compile(schema)
})

// Register CORS (Configure CORS for frontend integration)
fastify.register(fastifyCors, {
  origin: '*', // Change '*' to your frontend domain for better security in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
})

// Middleware for Authentication
fastify.decorate('authMiddleware', require('./middlewares/authMiddleware'))

// Register Swagger
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Muthawwif Service API',
      description: 'API documentation for Muthawwif Service backend',
      version: '1.0.0',
    },
    host: 'localhost:5000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description:
          'Enter the Bearer token in the format: Bearer <accessToken>',
      },
    },
    security: [{ BearerAuth: [] }], // Apply globally if necessary
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Services', description: 'Muthawwif services management' },
      { name: 'Availability', description: 'Muthawwif availability endpoints' },
      { name: 'Bookings', description: 'Booking service endpoints' },
    ],
  },
})

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
})

// Register Routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' })
fastify.register(require('./routes/users'), { prefix: '/api/users' })
fastify.register(require('./routes/muthawwifList'), {
  prefix: '/api',
})
fastify.register(require('./routes/nationalities'), {
  prefix: '/api',
})
fastify.register(require('./routes/muthawwifService'), {
  prefix: '/api/services',
})
fastify.register(require('./routes/availability'), {
  prefix: '/api/availability',
})
fastify.register(require('./routes/addAvailability'), {
  prefix: '/api/availability',
})
fastify.register(require('./routes/getAvailability'), {
  prefix: '/api/availability',
})
fastify.register(require('./routes/delAvailability'), {
  prefix: '/api/availability',
})
fastify.register(require('./routes/bookingService'), {
  prefix: '/api/service',
})
fastify.register(require('./routes/myBookings'), {
  prefix: '/api/service',
})
fastify.register(require('./routes/getMuthawwifDetail'), {
  prefix: '/api',
})

// Scheduler to delete expired tokens
cron.schedule('0 */1 * * *', async () => {
  console.log('Running token cleanup task...')
  try {
    const [result] = await db.query(
      'DELETE FROM tokens WHERE expires_at < NOW()'
    )
    console.log(
      `Token cleanup task completed. Deleted rows: ${result.affectedRows}`
    )
  } catch (error) {
    console.error('Error during token cleanup task:', error)
  }
})

// Start Server
const start = async () => {
  try {
    await fastify.listen({ port: 5000 })
    console.log('🚀 Server running on http://localhost:5000')
    console.log('Swagger documentation available at http://localhost:5000/docs')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
