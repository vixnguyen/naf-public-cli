let { actions } = require('@core/based/controller')({
  model: 'book'
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

exports.bookAction = actions
