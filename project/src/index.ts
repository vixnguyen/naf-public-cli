import 'module-alias/register';
import { AddressInfo } from 'net';

// Import Routes
import routes from './routes/app.route'

// Import Swagger Options
import swaggerOptions, { swaggerUiOptions } from './config/swagger'

// Require the fastify framework and instantiate it
import Fastify from 'fastify'

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    },
    serializers: {
      req(req: any) {
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

// Send boom errors with their own status code, e.g. 400 or 404
app.setErrorHandler((err: any, req, reply) => {
  if (err.isBoom) {
    if (err.output.statusCode >= 500) {
      req.log.error(err)
    }
    reply.code(err.output.statusCode).send(err.output.payload)
    return
  }
  reply.send(err)
})

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

// Require external modules
import mongoose from 'mongoose'

// Import DB Config
import dbConfig from './config/db'

// Server and database settings, can be overridden with environment variables
const port = Number(process.env.PORT) || 2101
const host = process.env.HOST || 'localhost'
const mongoUri = process.env.MONGODB_URI || `mongodb://${dbConfig.host}/${dbConfig.name}`

// Connect to DB
mongoose.connect(mongoUri)
  .then(() => app.log.info('MongoDB connected...'))
  .catch((err: any) => app.log.error(err))

// Run the server!
const start = async () => {
  try {
    // Register Swagger before the routes so they are included in the documentation
    await app.register(fastifySwagger, swaggerOptions)
    await app.register(fastifySwaggerUi, swaggerUiOptions)

    // Loop over each route
    routes.forEach((route: any, index: number) => {
      app.route(route)
    })

    await app.listen({ port, host })
    app.swagger()
    app.log.info(`server listening on ${(app.server.address() as AddressInfo).port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
