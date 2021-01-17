require('dotenv').config()
const config = require('./knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)
const express = require('express')
var logger = require('morgan')

const getGameData = async (matchId) => {
  const result = await knex('games').select().where({ matchId })
  console.log('db result', result)
  if (result.length == 0) {
    return null
  }
  const game = result[0]
  return {
    matchId: game.matchId,
    gameData: JSON.parse(game.gameData),
  }
}

const addOrUpdateGame = async (matchId, data) => {
  const result = await knex('games').select().where({ matchId })
  console.log(result)
  if (result.length == 0) {
    console.log('creating game', matchId)
    return knex('games').insert({
      matchId,
      gameData: JSON.stringify(data),
    })
  } else {
    console.log('updating game', matchId)
    return knex('games')
      .where({ matchId })
      .update({
        gameData: JSON.stringify(data),
      })
  }
}

// addOrUpdateGame(matchId, data).then(() => process.exit(0))

const app = express()


app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/db/game/:matchId', async (req, res) => {
  const { matchId } = req.params
  console.log(matchId)
  const game = await getGameData(matchId)
  return res.json(game)
})

app.post('/db/game', async (req, res) => {
  const { matchId, gameData } = req.body
  const result = await addOrUpdateGame(matchId, gameData)
  return res.send('OK')
})

module.exports = app