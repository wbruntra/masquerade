exports.up = function (knex, Promise) {
  return knex.schema.createTable('games', function (table) {
    table.increments()
    table.string('matchId').notNullable()
    table.text('gameData')
    table.unique('matchId')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('games')
}
