require('dotenv').config()
const { Server } = require('boardgame.io/server')
const { Masquerade } = require('./Game')

const server = Server({ games: [Masquerade] })

server.run(process.env.REACT_APP_SERVER_PORT)
