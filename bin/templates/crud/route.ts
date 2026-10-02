/**
 * The importer will return four objects
 * 1. routes: an array of crud routes
 * 2. handler: the actions of the controller, including the new ones
 * 3. path: the url of the routes, e.g. /posts
 * 4. schema: the request schemas, for the documentation and the validation
 */
import { BaseRoute } from '@core/based/route'

const { routes, handler, path, schema }: any = new BaseRoute({
	controller: '__MODEL__''__PATH__''__DIR__'
})

/**
 * Adding a route for a new action of the controller
 * For example, replace the export below with:
 * export default [
 *   ...routes,
 *   { method: 'GET', url: `${path}/by-name/:name`, handler: handler.byName, schema: schema.byName }
 * ]
 * A fixed url such as `${path}/by-name/:name` is matched before `${path}/:id`
 * The schema is additional, add it in the schema file of this controller
 */

export default routes
