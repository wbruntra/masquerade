const path = require('path')

const masquerade_db = {
  name: 'masquerade_db',
  script: path.join(__dirname, 'app.js'),
  autorestart: true,
  watch: false,
  max_memory_restart: '128M',
  env: {
    NODE_ENV: 'production',
    DB_PORT: '3011',
  },
}

const masquerade_server = {
  name: 'masquerade_server',
  script: path.join(__dirname, 'src', 'server.js'),
  node_args: '-r esm',
  autorestart: true,
  watch: false,
  max_memory_restart: '128M',
  env: {
    NODE_ENV: 'production',
    PORT: '8010',
    REACT_APP_SERVER_PORT: '8010',
  },
}

module.exports = {
  apps: [masquerade_db, masquerade_server],
}
