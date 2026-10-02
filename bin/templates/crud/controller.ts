/**
 * The importer will return three objects
 * 1. actions is a basic and always
 * 2. boom: to handle action errors
 * 3. model: is a data model
 */
import { BaseController } from '@core/based/controller'

const { actions }: any = new BaseController({
	model: '__MODEL__'
})

/**
 * Adding new action here
 * For example:
 * actions.filterByName = async (req, reply) => {
 *  // todo
 * }
 * or replace the export below with:
 * const newActions = {
 *  filterByName: async (req, reply) => {
 *    // todo
 *  }
 * }
 * export default { ...actions, ...newActions }
 */

export default actions
