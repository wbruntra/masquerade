import './styles/index.scss'
import _ from 'lodash'
import { Masquerade } from './Game'
import { Client } from 'boardgame.io/react'
import { Local } from 'boardgame.io/multiplayer'
import { SocketIO } from 'boardgame.io/multiplayer'
import Board from './Board'
import CreateGame from './CreateGame'
import JoinGame from './JoinGame'
import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useHistory,
} from 'react-router-dom'
import axios from 'axios'
import { getPlayerSlots } from './utils'

const queryString = require('query-string')
require('dotenv').config()

const PORT = process.env.REACT_APP_SERVER_PORT

const Menu = () => {
  const [code, setCode] = useState('')
  return (
    <div className="container">
      <Link to="/create">Host</Link>
      <hr />
      <Link to={`/join/${code}`}>Join</Link>
      <input value={code} onChange={(e) => setCode(e.target.value)} />
    </div>
  )
}

const ServerGame = (props) => {
  const { host } = props
  let config, playerId, numPlayers, players
  let MasqueradeClient
  const [matchData, setMatchData] = useState({})
  const { matchId, yourName } = useParams()
  const history = useHistory()
  const [playerName, setPlayerName] = useState(yourName || '')
  const [inputPlayer, setInputPlayer] = useState('')
  let clientOpts

  useEffect(() => {
    const getMatchData = async () => {
      axios.get(`/db/game/${matchId}`).then(({ data }) => {
        if (data.gameData) {
          setMatchData(data.gameData)
        }
      })
    }
    return getMatchData()
  }, [matchId])

  if (host) {
    const data = JSON.parse(window.localStorage.getItem('gameData'))
    console.log(data)
    playerId = '0'
    numPlayers = data.numPlayers
    players = data.players
    clientOpts = {
      game: Masquerade,
      numPlayers,
      board: Board,
      multiplayer: SocketIO({ server: process.env.REACT_APP_SOCKER_SERVER }),
    }
    console.log(clientOpts)
    MasqueradeClient = Client({ ...clientOpts, debug: false })

    return (
      <div className="container">
        <MasqueradeClient matchID={matchId} playerID={'0'} playerNames={getPlayerSlots(players)} />
      </div>
    )
  }

  if (_.isEmpty(matchData)) {
    return null
  }

  const matchPlayers = matchData.players

  MasqueradeClient = Client({
    game: Masquerade,
    numPlayers: matchPlayers.length,
    board: Board,
    multiplayer: SocketIO({ server: process.env.REACT_APP_SOCKER_SERVER }),
    debug: false,
  })

  const playerIndex = matchPlayers.indexOf(playerName)

  if (playerIndex === -1) {
    return (
      <div>
        Who are you?
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            value={playerName}
            onChange={(e) => {
              // window.localStorage.setItem('savedName', e.target.value)
              setPlayerName(e.target.value)
            }}
          />
        </form>
      </div>
    )
  }

  return (
    <div className="container">
      <MasqueradeClient
        matchID={matchId}
        playerID={playerIndex.toString()}
        playerNames={getPlayerSlots(matchPlayers)}
      />
    </div>
  )
}

function LocalGame() {
  const MasqueradeClient = Client({
    game: Masquerade,
    numPlayers: 4,
    board: Board,
    multiplayer: Local({
      persist: true,
    }),
  })

  const playerNames = ['bill', 'jim', 'ed', 'bernie']

  return (
    <div className="container">
      <MasqueradeClient playerID={'0'} playerNames={getPlayerSlots(playerNames)} />
      <hr />
      <MasqueradeClient playerID={'1'} playerNames={getPlayerSlots(playerNames)} />
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create">
          <CreateGame />
        </Route>
        <Route path="/host/:matchId">
          <ServerGame host={true} />
        </Route>
        <Route path="/join/:matchId/:yourName">
          <ServerGame />
        </Route>
        <Route path="/join/:matchId">
          <ServerGame />
        </Route>
        <Route exact path="/join">
          <JoinGame />
        </Route>
        <Route path="/">
          <Menu />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
