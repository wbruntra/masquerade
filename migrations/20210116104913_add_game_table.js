exports.up = function (knex, Promise) {
  return knex.schema.createTable('games', function (table) {
    table.string('matchId').primary()
    table.text('gameData')
    table.unique('matchId')
    table.datetime('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('games')
}
