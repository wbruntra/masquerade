require('dotenv').config()
const { Server, Origins } = require('boardgame.io/server')
const { Masquerade } = require('./client/src/Game')
const keys = require('./keys')

const server = Server({ games: [Masquerade], origins: [Origins.LOCALHOST, ...keys.origins] })

console.log('run on ', process.env.REACT_APP_SERVER_PORT)

server.run(process.env.REACT_APP_SERVER_PORT)
