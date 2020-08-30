import 'module-alias/register';

// Import Routes
import routes from './routes/app.route'

// Import Swagger Options
import swaggerOptions  from './config/swagger'

// Require the fastify framework and instantiate it
const fastify = require('fastify')

const app = fastify({
  logger: {
    prettyPrint: true,
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

const fastifySwagger = require('fastify-swagger')

// Register Swagger
app.register(fastifySwagger, swaggerOptions)

// Require external modules
const mongoose = require('mongoose')

// Import DB Config
import dbConfig from './config/db'

// Connect to DB
mongoose.connect(`mongodb://${dbConfig.host}/${dbConfig.name}`)
  .then(() => console.log('MongoDB connected...'))
  .catch((err: any) => console.log(err))

// Loop over each route
routes.forEach((route: any, index: number) => {
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
