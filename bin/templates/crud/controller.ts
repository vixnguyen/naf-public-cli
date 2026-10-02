/**
 * The importer will return six objects
 * 1. actions: the CRUD actions, always exported. index filters and sorts, e.g. ?active=true&sort=-price,name
 * 2. model: the mongoose model, for new actions
 * 3. toBoom: turns an error into a 400 for invalid data or ids, otherwise a 500
 * 4. found: returns the document, or throws a 404 when it is null
 * 5. parseQuery: turns the query string into { filter, sort } for mongoose, as index does
 * 6. boom: to send other errors, e.g. boom.forbidden()
 */
import { BaseController } from '@core/based/controller'

const { actions, model, toBoom, found, parseQuery, boom }: any = new BaseController({
	model: '__MODEL__'
})

/**
 * Adding new action here
 * For example, list the items with a given name:
 * actions.byName = async (req: any, reply: any) => {
 *   try {
 *     return await model.find({ name: req.params.name })
 *   } catch (err) {
 *     throw toBoom(err)
 *   }
 * }
 * or get one item by its name, with a 404 when there is none:
 *     return found(await model.findOne({ name: req.params.name }))
 * Then add a route for the action in the route file of this controller
 *
 * Changing a default action (index, read, create, update, delete), here in the controller,
 * e.g. only the active items, still with the filters and sort of the query string:
 * actions.index = async (req: any, reply: any) => {
 *   try {
 *     const { filter, sort } = parseQuery(req.query)
 *     return await model.find({ ...filter, active: true }).sort(sort)
 *   } catch (err) {
 *     throw toBoom(err)
 *   }
 * }
 * or wrap it to keep its behavior:
 * const baseCreate = actions.create
 * actions.create = async (req: any, reply: any) => {
 *   req.body.name = req.body.name.trim()
 *   return baseCreate(req, reply)
 * }
 * Changing an action in the route file has no effect, the routes already use the actions from here
 */

export default actions
