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
 *    toBoom: turns an error into a 400 for invalid data or ids, otherwise a 500
 *    found: returns the document, or throws a 404 when it is null
 *    parseQuery: turns the query string into a mongoose filter and sort, as used by index
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

    // Type of a field of the model, e.g. String, Number, Boolean, Date or ObjectId
    const fieldType = (key: string) => (key.startsWith('$') || key === '__v' ? undefined : dataModel.schema.path(key)?.instance)

    // Convert a query string value to the type of its field
    const toFieldValue = (key: string, value: any) => {
      const type = fieldType(key)
      if (type === 'Number') {
        const number = Number(value)
        if (value === '' || Number.isNaN(number)) {
          throw boom.badRequest(`Filter "${key}" must be a number`)
        }
        return number
      }
      if (type === 'Boolean') {
        if (value === true || value === 'true') {
          return true
        }
        if (value === false || value === 'false') {
          return false
        }
        throw boom.badRequest(`Filter "${key}" must be true or false`)
      }
      if (type === 'Date') {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          throw boom.badRequest(`Filter "${key}" must be a date`)
        }
        return date
      }
      // ids are checked by mongoose, an invalid one becomes a 400 with toBoom
      return String(value)
    }

    /**
     * Turn the query string into a mongoose filter and sort
     * e.g. ?active=true&category=<id>&sort=-price,name
     * Every other parameter must be a field of the model, it is matched exactly
     */
    const parseQuery = (query: any = {}) => {
      const filter: any = {}
      for (const [key, value] of Object.entries(query)) {
        if (key === 'sort') {
          continue
        }
        if (!fieldType(key)) {
          throw boom.badRequest(`Unknown filter "${key}"`)
        }
        if (typeof value === 'object' && value !== null) {
          throw boom.badRequest(`Filter "${key}" takes one value`)
        }
        filter[key] = toFieldValue(key, value)
      }
      const sort: any = {}
      for (const item of String(query.sort ?? '').split(',').map((part) => part.trim()).filter(Boolean)) {
        const key = item.replace(/^-/, '')
        if (!fieldType(key)) {
          throw boom.badRequest(`Unknown sort field "${key}"`)
        }
        sort[key] = item.startsWith('-') ? -1 : 1
      }
      return { filter, sort }
    }

    return {
      boom: boom,
      model: dataModel,
      toBoom: toBoom,
      found: found,
      parseQuery: parseQuery,
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
            const { filter, sort } = parseQuery(req.query)
            const data = await dataModel.find(filter).sort(sort)
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
