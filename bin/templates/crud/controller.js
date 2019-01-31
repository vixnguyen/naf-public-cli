/**
 * The importer will return three objects
 * 1. actions is a basic and always
 * 2. boom: to handle action errors
 * 3. model: is a data model
 */
let { actions } = require('@core/based/controller')({
  model: '__MODEL__'
})

/**
 * Adding new action here
 * For example:
 * actions.filterByName = (req, reply) => {
 *  // todo
 * }
 * or
 * const newActions = {
 *  filterByName: (req, reply) => {
 *    // todo
 *  }
 * }
 * { ...actions, ...newActions }
 */

exports.__MODEL__Action = actions
