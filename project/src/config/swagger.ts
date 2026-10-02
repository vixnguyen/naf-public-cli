const swaggerOptions: any = {
  swagger: {
    info: {
      title: 'Node API with Fastify',
      description: 'A CLI project, It helps to build a fast REST APIs with Node.js, MongoDB, Fastify and Swagger.',
      version: '1.0.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
};

export const swaggerUiOptions: any = {
  routePrefix: '/documentation'
};

export default swaggerOptions;
