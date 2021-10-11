import { Client } from 'boardgame.io/client'
import { effectRoleAction, Masquerade } from './Game'
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

const noChallengeG = {
  challengingPlayers: [],
}

test('judge works', () => {
  const G = {
    ...noChallengeG,
    chosenRole: 'judge',
    scores: {
      0: 5,
    },
    coinsOnCourt: 3,
  }
  effectRoleAction(G, { currentPlayer: '0' })
  expect(G).toEqual({
    ...G,
    scores: {
      0: 8,
    },
    coinsOnCourt: 0,
  })
})

test('queen works', () => {
  const originalScore = 5
  const G = {
    ...noChallengeG,
    chosenRole: 'queen',
    scores: {
      0: originalScore,
    },
  }
  effectRoleAction(G, { currentPlayer: '0' })
  expect(G.scores[0]).toEqual(originalScore + 2)
})

test('king works', () => {
  const originalScore = 5
  const G = {
    ...noChallengeG,
    chosenRole: 'king',
    scores: {
      0: originalScore,
    },
  }
  effectRoleAction(G, { currentPlayer: '0' })
  expect(G.scores[0]).toEqual(originalScore + 3)
})

test('witch works', () => {
  const G = {
    ...noChallengeG,
    chosenRole: 'witch',
    roleTarget: '1',
    scores: {
      0: 2,
      1: 9,
    },
  }
  effectRoleAction(G, { currentPlayer: '0' })
  expect(G).toEqual({
    ...G,
    scores: {
      0: 9,
      1: 2,
    },
  })
})

test('bishop works', () => {
  const G = {
    ...noChallengeG,
    chosenRole: 'bishop',
    roleTarget: '1',
    scores: {
      0: 3,
      1: 6,
    },
  }
  effectRoleAction(G, { currentPlayer: '0' })
  expect(G).toEqual({
    ...G,
    scores: {
      0: 5,
      1: 4,
    },
  })
})

test('cheat works', () => {
  const G = {
    ...noChallengeG,
    chosenRole: 'cheat',
    scores: {
      0: 10,
    },
    winner: null,
  }
  effectRoleAction(G, { currentPlayer: '0' })
  expect(G.winner).toEqual('0')
})

test('thief works', () => {
  const scores = {
    0: 2,
    1: 4,
    2: 8,
    3: 10,
  }
  const G = {
    ...noChallengeG,
    chosenRole: 'thief',
    scores: {
      ...scores,
    },
  }
  effectRoleAction(G, {
    currentPlayer: '0',
    playOrderPos: 0,
    numPlayers: Object.keys(scores).length,
  })
  expect(G.scores[0]).toEqual(4)
  expect(G.scores[1]).toEqual(3)
  expect(G.scores[3]).toEqual(9)

  const G2 = {
    ...noChallengeG,
    chosenRole: 'thief',
    scores: {
      ...scores,
    },
  }
  effectRoleAction(G2, {
    currentPlayer: '3',
    playOrderPos: 3,
    numPlayers: Object.keys(scores).length,
  })
  expect(G2.scores[2]).toEqual(7)
  expect(G2.scores[3]).toEqual(12)
  expect(G2.scores[0]).toEqual(1)
})

test('playing cheat with 10 coins wins the game', () => {
  // set up a specific board scenario
  const MasqueradeScenario = {
    ...Masquerade,
    setup: (ctx) => {
      return {
        ...neutralGameState,
        scores: { 0: 10 },
        declarer: '0',
        chosenRole: 'cheat',
      }
    },
  }

  // initialize the client with your custom scenario
  const client = Client({
    game: MasqueradeScenario,
  })
  client.events.setPhase('resolveRole')
  // console.log(client.events)

  client.moves.finishRolePhase()

  const { G, ctx } = client.store.getState()

  expect(G.winner).toEqual('0')
  expect(ctx.gameover).toEqual({ winner: '0' })
})
