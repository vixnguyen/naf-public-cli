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

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

// Require external modules
import mongoose from 'mongoose'

// Import DB Config
import dbConfig from './config/db'

// Connect to DB
mongoose.connect(`mongodb://${dbConfig.host}/${dbConfig.name}`)
  .then(() => console.log('MongoDB connected...'))
  .catch((err: any) => console.log(err))

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

    await app.listen({ port: 2101 })
    app.swagger()
    app.log.info(`server listening on ${(app.server.address() as AddressInfo).port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
