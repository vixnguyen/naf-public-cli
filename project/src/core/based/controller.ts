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
export class BaseController {
  constructor(options: any) {

    // Get options
    const { model } = options
    
    // External Dependencies
    const boom = require('@hapi/boom')
    // Get Data Models
    const dataModel = require(`@models/${model}.model`).default

    // Map mongoose errors to client errors, everything else to a server error
    const toBoom = (err: any) => {
      if (err.isBoom) {
        return err
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return boom.badRequest(err.message)
      }
      return boom.boomify(err)
    }

    // Throw a 404 when the document does not exist
    const found = (obj: any) => {
      if (!obj) {
        throw boom.notFound(`${model} not found`)
      }
      return obj
    }

    return {
      boom: boom,
      model: dataModel,
      actions: {
        test: async (req: any, reply: any) => {
          try {
            return `${model} works!!!`
          } catch (err) {
            throw toBoom(err)
          }
        },
        index: async (req: any, reply: any) => {
          try {
            const data = await dataModel.find()
            return data
          } catch (err) {
            throw toBoom(err)
          }
        },
        create: async (req: any, reply: any) => {
          try {
            const newObj = new dataModel(req.body)
            const savedObj = await newObj.save()
            reply.code(201)
            return savedObj
          } catch (err) {
            throw toBoom(err)
          }
        },
        read: async (req: any, reply: any) => {
          try {
            const id = req.params.id
            const obj = await dataModel.findById(id)
            return found(obj)
          } catch (err) {
            throw toBoom(err)
          }
        },
        update: async (req: any, reply: any) => {
          try {
            const id = req.params.id
            const updateData = req.body
            const updatedObj = await dataModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            return found(updatedObj)
          } catch (err) {
            throw toBoom(err)
          }
        },
        delete: async (req: any, reply: any) => {
          try {
            const id = req.params.id
            const obj = await dataModel.findByIdAndDelete(id)
            return found(obj)
          } catch (err) {
            throw toBoom(err)
          }
        }
      }
    }
  }
}
