/**
 * Request schemas for the CRUD routes, also used for the Swagger documentation
 * Keep the body properties in sync with the fields of your model
 * Unknown body properties are removed before they reach the controller
 *
 * You can also document the responses, for example:
 * response: {
 *   200: {
 *     type: 'object',
 *     properties: {
 *       _id: { type: 'string' },
 *       name: { type: 'string' }
 *     }
 *   }
 * }
 * Note that fields missing from a response schema are removed from the response
 *
 * A new action of the controller can have its schema in the export below too, for example:
 * byName: {
 *   tags,
 *   summary: 'List the items with a name',
 *   params: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }
 * }
 */
const tags = ['__MODEL__']

const body = {
  type: 'object',
  properties: {
    __BODY_PROPERTIES__
  },
  additionalProperties: false
}

// filters and sort of the list, e.g. ?active=true&sort=-price,name
const querystring = {
  type: 'object',
  properties: {
    __BODY_PROPERTIES__,
    sort: { type: 'string', description: 'Comma separated fields to sort by, - for descending, e.g. -price,name' }
  }
}

const params = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
  },
  required: ['id']
}

export default {
  index: {
    tags,
    summary: 'List the items, filtered by any field and sorted',
    querystring
  },
  read: {
    tags,
    summary: 'Get an item by id',
    params
  },
  create: {
    tags,
    summary: 'Create a new item',
    body: { ...body, required: __REQUIRED__ }
  },
  update: {
    tags,
    summary: 'Update an item by id',
    params,
    body
  },
  delete: {
    tags,
    summary: 'Delete an item by id',
    params
  }
}
