/**
 * For extending CRUD routes for specific controller
 * @param {*} options 
 * {
 *    controller: is a controller name
 *    dir: the directory of the controller, it is additional
 *    path: the custom path for route, it is additional
 * }
 * @returns {*} anonymous object
 * {
 *    handler: controller action to handle logical code
 *    path: the correct path for route
 *    schema: the api documentation
 *    routes: an array of crud routes
 * }
 */

interface RouteConfig {
  controller?: string;
  dir?: string;
  path?: string;
}

export class BaseRoute implements RouteConfig {
  constructor (options: RouteConfig) {
    const defaultOptions: RouteConfig = {
      controller: '',
      dir: ''
    }
    const { controller, dir, path } = { ...defaultOptions, ...options }
    const relativePath = `${dir}${controller}`
  
    // Import Controllers
    const handler = require(`@controllers/${relativePath}.controller`).default
    console.info(handler)
  
    // Import Swagger documentation & get Schema
    const schema = require(`@schemas/${relativePath}.schema`).default
    console.info(schema)
  
    // Define url
    const route = path ? `/${path}` : `/${relativePath}s`
  
    return {
      handler: handler,
      schema: schema,
      path: route,
      routes: [
        {
          method: 'GET',
          url: `${route}`,
          handler: handler.index,
          schema: schema.index || null
        },
        {
          method: 'GET',
          url: `${route}/test`,
          handler: handler.test
        },
        {
          method: 'GET',
          url: `${route}/:id`,
          handler: handler.read,
          schema: schema.read || null
        },
        {
          method: 'POST',
          url: `${route}`,
          handler: handler.create,
          schema: schema.create || null
        },
        {
          method: 'PUT',
          url: `${route}/:id`,
          handler: handler.update,
          schema: schema.update || null
        },
        {
          method: 'DELETE',
          url: `${route}/:id`,
          handler: handler.delete,
          schema: schema.delete || null
        }
      ]
    }
  }
}
