export default [
  {
    method: 'GET',
    url: '/',
    handler: async () => {
      try {
        return `API Server is running!`
      } catch (err) {
        throw err
      }
    }
  }
]
