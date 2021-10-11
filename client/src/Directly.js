import { Masquerade } from './Game'
import { Client } from 'boardgame.io/react'
import { SocketIO } from 'boardgame.io/multiplayer'
import Board from './Board'

const Directly = () => {
  const MasqueradeClient = Client({
    game: Masquerade,
    numPlayers: 4,
    board: Board,
    multiplayer: SocketIO({ server: process.env.REACT_APP_SOCKET_SERVER }),
    debug: false,
  })

  return <MasqueradeClient playerID={'0'} playerNames={['bill', 'jim', 'bob', 'steve']} />
}

export default Directly
