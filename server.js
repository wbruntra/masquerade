require('dotenv').config()
const { Server } = require('boardgame.io/server')
const { Masquerade } = require('./client/src/Game')

const server = Server({ games: [Masquerade] })

console.log('run on ', process.env.REACT_APP_SERVER_PORT)

server.run(process.env.REACT_APP_SERVER_PORT)
