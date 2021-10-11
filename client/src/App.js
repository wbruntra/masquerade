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
import { BrowserRouter as Router, Switch, Route, Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { getPlayerSlots } from './utils'
import MainContainer from './MainContainer'

require('dotenv').config()

const Menu = () => {
  const [code, setCode] = useState('')
  return (
    <MainContainer>
      <Link to="/create">Host</Link>
      <hr />
      <Link to={`/join/${code}`}>Join (enter code):</Link>
      <input className="ml-3" value={code} onChange={(e) => setCode(e.target.value)} />
    </MainContainer>
  )
}

const ServerGame = (props) => {
  const { host } = props
  let playerId, numPlayers, players
  let MasqueradeClient
  const [matchData, setMatchData] = useState({})
  const { matchId, yourName } = useParams()
  const [playerName, setPlayerName] = useState(yourName || '')
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
    console.log('saved data', data)
    playerId = '0'
    numPlayers = data.numPlayers
    players = data.players
    clientOpts = {
      game: Masquerade,
      numPlayers,
      board: Board,
      multiplayer: SocketIO({ server: process.env.REACT_APP_SOCKET_SERVER }),
    }
    console.log('client opts', clientOpts)
    MasqueradeClient = Client({ ...clientOpts, debug: false })

    return (
      <MainContainer>
        <MasqueradeClient matchID={matchId} playerID={'0'} playerNames={getPlayerSlots(players)} />
      </MainContainer>
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
    multiplayer: SocketIO({ server: process.env.REACT_APP_SOCKET_SERVER }),
    debug: false,
  })

  const playerIndex = matchPlayers.indexOf(playerName)

  if (playerIndex === -1) {
    return (
      <MainContainer>
        <p className="mb-3">Who are you?</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            value={playerName}
            autoFocus
            onChange={(e) => {
              // window.localStorage.setItem('savedName', e.target.value)
              setPlayerName(e.target.value)
            }}
          />
        </form>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      <MasqueradeClient
        matchID={matchId}
        playerID={playerIndex.toString()}
        playerNames={getPlayerSlots(matchPlayers)}
      />
    </MainContainer>
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
        {/* <Route path="/local">
          <LocalGame />
        </Route> */}
        <Route path="/">
          <Menu />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
