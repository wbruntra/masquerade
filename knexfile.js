const config = require('./keys')

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: `${config['development'].WORK_DIR}/dbs/dev.sqlite3`,
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: `${config['production'].WORK_DIR}/dbs/db.games`,
    },
  },
}
