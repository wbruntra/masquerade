const env = process.env.NODE_ENV || 'development'
const config = require('./keys')[env]

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: `${config.WORK_DIR}/dev.sqlite3`,
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: `${config.WORK_DIR}/db.games`,
    },
  },
}
