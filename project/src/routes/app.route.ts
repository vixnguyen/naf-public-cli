// Import routes
import indexRoute from './health-check.route'
import newsRoute from './news.route'

export default [
	...indexRoute,
	...newsRoute
]
