const BASE = '/home/william/workspace/games/masquerade/'

const masquerade_db = {
  name: 'masquerade_db',
  cwd: BASE,
  script: `app.js`,
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '128M',
  env: {
    NODE_ENV: 'production',
    DB_PORT: '3011',
  },
}

module.exports = {
  apps: [masquerade_db],
}
