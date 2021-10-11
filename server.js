require('dotenv').config()
const { Server, Origins } = require('boardgame.io/server')
const { Masquerade } = require('./client/src/Game')
const keys = require('./keys')
const fs = require('fs')

const server =
  process.env.NODE_ENV === 'production'
    ? Server({
        games: [Masquerade],
        origins: [Origins.LOCALHOST, ...keys.origins],
      })
    : Server({ games: [Masquerade], origins: [Origins.LOCALHOST] })

console.log('run on ', process.env.REACT_APP_SERVER_PORT)

server.run(process.env.REACT_APP_SERVER_PORT)
