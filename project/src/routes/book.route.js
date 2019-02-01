let { routes } = require('@core/based/route')({
  controller: 'book'
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
