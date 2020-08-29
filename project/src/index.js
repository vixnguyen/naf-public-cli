// Require the module alias
// require('module-alias/register')

// Import Routes
import routes from './routes/app.route.js'

// Import Swagger Options
import swaggerOptions  from './config/swagger.js'

// Require the fastify framework and instantiate it
import fastify from 'fastify'

const app = fastify({
  logger: {
    prettyPrint: true,
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          path: req.path,
          parameters: req.parameters,
          body: req.body,
          headers: req.headers,
        };
      }
    }
  }
})

import fastifySwagger from 'fastify-swagger'

// Register Swagger
app.register(fastifySwagger, swaggerOptions)

// Require external modules
import mongoose from 'mongoose'

// Import DB Config
import db from './config/db.js'

// Connect to DB
mongoose.connect(`mongodb://${db.host}/${db.name}`)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err))

// Loop over each route
routes.forEach((route, index) => {
  app.route(route)
})

// Run the server!
const start = async () => {
  try {
    await app.listen(2101)
    app.swagger()
    app.log.info(`server listening on ${app.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
