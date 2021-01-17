// import { Client } from 'boardgame.io/client'
// import { Local } from 'boardgame.io/multiplayer'

// import { effectRoleAction, Masquerade } from './Game'
import { setupRoles, setupScores } from './utils'
import { roleSets } from './config'

const roles = setupRoles(4)

const neutralGameState = {
  roles,
  originalRoles: { ...roles },
  roleList: roleSets[4],
  scores: setupScores(4),
  coinsOnCourt: 1,
  playersToPenalize: [],
  chosenRole: null,
  challengingPlayers: [],
  playersToShow: [],
  playerToAct: null,
  declarer: null,
  nextPlayer: 0,
  chosenAction: null,
  swapTarget: null,
  roleTarget: null,
  noValidRolePlayer: false,
  revealedPlayers: [],
  playerMustSwap: false,
  declaredAt: null,
}

test('math is okay', () => {
  expect(1 + 1).toBe(2)
})
