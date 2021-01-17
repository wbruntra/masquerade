const app = require('./db')
var http = require('http')
var port = process.env.DB_PORT

app.set('port', port)
var server = http.createServer(app)

server.listen(port)
server.on('listening', () => {
  console.log(`listening on ${port}`)
})
