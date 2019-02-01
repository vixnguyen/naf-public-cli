/**
 * For extending CRUD action for specific model
 * @param {*} options
 * {
 *    model: an alias of the model
 * }
 * @returns {*} anonymous object
 * {
 *    boom: is an object for handling error 
 *    model: data model for processing actions
 *    actions: is based action included CRUD and test action
 * }
 */
module.exports = (options) => {

  // External Dependencies
  const boom = require('boom')
  // Get options
  const { model } = options
  // Get Data Models
  const dataModel = require(`@models/${model}.model`)
  
  return {
    boom: boom,
    model: dataModel,
    actions: {
      test: async (req, reply) => {
        try {
          return `${model} works!!!`
        } catch (err) {
          throw boom.boomify(err)
        }
      },
      index: async (req, reply) => {
        try {
          const data = await dataModel.find()
          return data
        } catch (err) {
          throw boom.boomify(err)
        }
      },
      create: async (req, reply) => {
        try {
          const newObj = new dataModel(req.body)
          return newObj.save()
        } catch (err) {
          throw boom.boomify(err)
        }
      },
      read: async (req, reply) => {
        try {
          const id = req.params.id
          const obj = await dataModel.findById(id)
          return obj
        } catch (err) {
          throw boom.boomify(err)
        }
      },
      update: async (req, reply) => {
        try {
          const id = req.params.id
          const obj = req.body
          const { ...updateData } = obj
          const updatedObj = await dataModel.findByIdAndUpdate(id, updateData, { new: true })
          return updatedObj
        } catch (err) {
          throw boom.boomify(err)
        }
      },
      delete: async (req, reply) => {
        try {
          const id = req.params.id
          const obj = await dataModel.findByIdAndRemove(id)
          return obj
        } catch (err) {
          throw boom.boomify(err)
        }
      }
    }
  }
}
