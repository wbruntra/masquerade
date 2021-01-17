import { useState, useEffect } from 'react'
import { Masquerade } from './Game'
import Board from './Board'
import randomstring from 'randomstring'
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom'


const JoinGame = () => {
  const [matchID, setMatchID] = useState(null)
  const [gameName, setGameName] = useState('fun')
  const history = useHistory()

  const joinGame = async (e) => {
    history.push(`/join/${gameName}`)
  }

  return (
    <div className="container">
      <h2>Join Game</h2>
      <form onSubmit={joinGame}>
        <div>
          <label htmlFor="game-name">Game Name</label>
          <input
            className="ml-3"
            id="game-name"
            value={gameName}
            onChange={(e) => {
              setGameName(e.target.value)
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

export default JoinGame
