// Import routes
const indexRoute = require('./index.route')
const bookRoute = require('./book.route')

module.exports = [
	...indexRoute,
	...bookRoute
]
