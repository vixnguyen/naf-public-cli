/**
 * The importer will return five objects
 * 1. actions: the CRUD actions, always exported
 * 2. model: the mongoose model, for new actions
 * 3. toBoom: turns an error into a 400 for invalid data or ids, otherwise a 500
 * 4. found: returns the document, or throws a 404 when it is null
 * 5. boom: to send other errors, e.g. boom.forbidden()
 */
import { BaseController } from '@core/based/controller'

const { actions, model, toBoom, found, boom }: any = new BaseController({
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
 * Changing a default action (index, read, create, update, delete), here in the controller:
 * actions.index = async (req: any, reply: any) => {
 *   try {
 *     return await model.find().sort({ name: 1 })
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
