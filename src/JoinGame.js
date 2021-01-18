import { useState } from 'react'
import { useHistory } from 'react-router-dom'


const JoinGame = () => {
  const [gameName, setGameName] = useState('')
  const [yourName, setYourName] = useState('')
  const history = useHistory()

  const joinGame = async (e) => {
    history.push(`/join/${gameName}/${yourName}`)
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
          <label htmlFor="your-name">Your Name</label>
          <input
            className="ml-3"
            id="your-name"
            value={yourName}
            onChange={(e) => {
              setYourName(e.target.value)
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
