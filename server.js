require('dotenv').config()
const { Server, Origins } = require('boardgame.io/server')
const { Masquerade } = require('./client/src/Game')
const keys = require('./keys')

const server =
  process.env.NODE_ENV === 'production'
    ? Server({
        games: [Masquerade],
        origins: [...keys.origins],
        https: {
          cert: fs.readFileSync(keys.ssl.ssl_certificate_path),
          key: fs.readFileSync(keys.ssl.ssl_certificate_key_path),
        },
      })
    : Server({ games: [Masquerade], origins: [Origins.LOCALHOST] })

console.log('run on ', process.env.REACT_APP_SERVER_PORT)

server.run(process.env.REACT_APP_SERVER_PORT)
