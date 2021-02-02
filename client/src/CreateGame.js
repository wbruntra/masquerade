import { useState } from 'react'
import randomstring from 'randomstring'
import {
  useHistory,
} from 'react-router-dom'
import axios from 'axios'

const CreateGame = () => {
  const [matchId, setMatchId] = useState(
    randomstring.generate({
      charset: 'alphabetic',
      length: 4,
      capitalization: 'lowercase',
    }),
  )
  const [players, setPlayers] = useState('jane, joe, milly, bill')
  const history = useHistory()

  const createGame = async (e) => {
    const gamePlayers = players.split(',').map((p) => p.trim())
    console.log(gamePlayers)
    const data = {
      matchId: matchId,
      players: gamePlayers,
      numPlayers: gamePlayers.length,
    }
    window.localStorage.setItem('gameData', JSON.stringify(data))
    e.preventDefault()
    console.log(data)
    axios
      .post('/db/game', {
        matchId,
        gameData: data,
      })
      .then(() => history.push(`/host/${data.matchId}`))
  }

  return (
    <div className="container">
      <h2>Create Game</h2>
      <form onSubmit={createGame}>
        <div>
          <label htmlFor="game-name">Game Name</label>
          <input
            className="ml-3"
            id="game-name"
            value={matchId}
            onChange={(e) => {
              setMatchId(e.target.value)
            }}
          />
        </div>
        <div>
          <label htmlFor="game-players">Players</label>
          <input
            className="w-50 ml-3"
            id="game-players"
            value={players}
            onChange={(e) => {
              setPlayers(e.target.value)
            }}
          />
        </div>
        <div>
          <input type="submit" value="Join Game" />
        </div>
      </form>
    </div>
  )
}

export default CreateGame
