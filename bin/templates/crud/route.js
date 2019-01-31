/**
 * The importer will return four objects
 * 1. handler: controller action to handle logical code
 * 2. path: the correct path for route
 * 3. schema: the api documentation
 * 4. routes: an array of crud routes
 */
let { routes } = require('@core/based/route')({
  controller: '__MODEL__''__PATH__''__DIR__'
})

/**
 * Adding new action here
 * For example:
 * const newRoutes = [
 *  {
 *    method: 'GET | POST | PUT | DELETE | etc...',
 *    url: `your url`,
 *    handler: `the action was defined in your controller`,
 *    schema: `this is additional`
 *  }
 * ]
 * routes = [...route, ...newRoutes]
 */

module.exports = routes
