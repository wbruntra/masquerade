import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import MainContainer from './MainContainer'


const JoinGame = () => {
  const [gameName, setGameName] = useState('')
  const [yourName, setYourName] = useState('')
  const history = useHistory()

  const joinGame = async (e) => {
    history.push(`/join/${gameName}/${yourName}`)
  }

  return (
    <MainContainer>
      <h2 className="mb-4">Join Game</h2>
      <form onSubmit={joinGame}>
        <div>
          <label htmlFor="game-name">Game Name</label>
          <input
            className="ml-3 mb-3"
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
            className="ml-3 mb-4"
            id="your-name"
            value={yourName}
            onChange={(e) => {
              setYourName(e.target.value)
            }}
          />
        </div>

        <div>
          <input className="btn btn-primary" type="submit" value="Join Game" />
        </div>
      </form>
    </MainContainer>
  )
}

export default JoinGame
