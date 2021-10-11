require('dotenv').config()
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/db',
    createProxyMiddleware({
      target: `http://localhost:${process.env.DB_PORT}`,
      changeOrigin: true,
    }),
  )
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: `http://localhost:${process.env.REACT_APP_SERVER_PORT}`,
      changeOrigin: true,
    }),
  )
}
