import _ from 'lodash'
import {
  getRolePlayers,
  validRolePlayerExists,
  gameHasWinner,
  setupScores,
  setupRoles,
} from './utils'
import { roleSets } from './config'

const getNextPlayer = (G, ctx) => {
  return (ctx.playOrderPos + 1) % ctx.playOrder.length
}

const addActionLog = (G, log) => {
  const logs = G.logs ? [...G.logs] : []
  logs.push(log)
  if (logs.length > 5) {
    logs.shift()
  }
  return logs
}

export const effectRoleAction = (G, ctx) => {
  const role = G.chosenRole
  const target = G.roleTarget
  const actor = ctx.currentPlayer
  let recentAction = {
    actor,
    action: 'did something unknown',
  }
  if (G.challengingPlayers.length > 0 && G.roles[actor] !== role) {
    return null
  }
  const targetScore = G.scores[target]
  const actorScore = G.scores[actor]
  let target_1, target_2
  const { swap_1, swap_2, foolSwap } = G
  if (role === 'king') {
    G.scores[actor] = G.scores[actor] + 3
    recentAction = { actor, action: 'took three coins from the bank as king' }
  }
  if (role === 'queen') {
    G.scores[actor] = G.scores[actor] + 2
    recentAction = { actor, action: 'took two coins from the bank as queen' }
  }
  if (role === 'judge') {
    G.scores[actor] = G.scores[actor] + G.coinsOnCourt
    recentAction = { actor, action: `took ${G.coinsOnCourt} coins from the courthouse as judge` }
    G.coinsOnCourt = 0
  }
  if (role === 'witch') {
    G.scores[actor] = targetScore
    G.scores[target] = actorScore
    recentAction = { actor, action: 'swapped fortunes with', target }
  }
  if (role === 'bishop') {
    G.scores[actor] = actorScore + 2
    G.scores[target] = targetScore - 2
    recentAction = { actor, action: 'took two coins from', target }
  }
  if (role === 'cheat') {
    if (actorScore >= 10) {
      G.winner = actor
    }
  }
  if (role === 'widow') {
    if (actorScore < 10) {
      G.scores[actor] = 10
    }
  }
  if (role === 'thief') {
    target_1 = (ctx.playOrderPos + 1) % ctx.numPlayers
    target_2 = (ctx.numPlayers + ctx.playOrderPos - 1) % ctx.numPlayers
    G.scores[target_1]--
    G.scores[target_2]--
    G.scores[actor] = G.scores[actor] + 2
    recentAction = { actor, action: 'took a coin from each player beside them' }
  }
  if (role === 'fool') {
    const swap_1_role = G.roles[swap_1]
    const swap_2_role = G.roles[swap_2]
    G.scores[actor]++
    if (foolSwap) {
      G.roles[swap_1] = swap_2_role
      G.roles[swap_2] = swap_1_role
    }
  }
  G.logs = addActionLog(G, recentAction)
}

/*
 * MOVES
 */

// RESOLVE ROLE PHASE

const chooseTarget = (G, ctx, target) => {
  G.roleTarget = target
}

const finishRolePhase = (G, ctx) => {
  effectRoleAction(G, ctx)
  ctx.events.endPhase()
}

// CHALLENGE STAGE MOVES

const forceResolve = (G, ctx) => {
  const { falseClaimants } = getRolePlayers(G)
  let recentAction
  G.playersToPenalize = falseClaimants
  let others = [...G.challengingPlayers]
  if (!validRolePlayerExists(G)) {
    G.noValidRolePlayer = true
    recentAction = {
      actor: ctx.currentPlayer,
      action: `was challenged, and nobody was really the ${G.chosenRole}`,
      challengers: others,
    }
  } else {
    if (G.challengingPlayers.length > 0) {
      recentAction = {
        actor: ctx.currentPlayer,
        action: `was challenged, and the real ${G.chosenRole} was`,
        target: validRolePlayerExists(G),
        challengers: others,
      }
    } else {
      recentAction = {
        actor: ctx.currentPlayer,
        action: `was not challenged`,
      }
    }
  }
  G.logs = addActionLog(G, recentAction)
  ctx.events.setPhase('resolveRole')
}

const challengeRespond = (G, ctx, response) => {
  if (response === 'challenge') {
    if (!G.challengingPlayers.includes(ctx.playerID)) {
      G.challengingPlayers.push(ctx.playerID)
    }
  }
  if (Object.keys(ctx.activePlayers).length === 2) {
    forceResolve(G, ctx)
  }
}

// BASIC TURN MOVES

const lookAtCard = (G, ctx) => {
  G.playersToShow[ctx.currentPlayer] = true
}

const chooseAction = (G, ctx, action, actionLog) => {
  G.chosenAction = action
  let recentAction
  if (action === 'look') {
    recentAction = {
      actor: ctx.currentPlayer,
      action: 'looked at their card',
    }
    const newLogs = addActionLog(G, recentAction)
    G.logs = newLogs
  }
}

const chooseSwapTarget = (G, ctx, target) => {
  G.swapTarget = target
}

const performSwap = (G, ctx, shouldSwap) => {
  if (shouldSwap) {
    const role_1 = G.roles[ctx.currentPlayer]
    const role_2 = G.roles[G.swapTarget]
    G.roles[ctx.currentPlayer] = role_2
    G.roles[G.swapTarget] = role_1
  }
  let recentAction = {
    actor: ctx.currentPlayer,
    target: G.swapTarget,
    action: 'swapped roles (or not) with',
  }
  G.logs = addActionLog(G, recentAction)
  ctx.events.endTurn()
}

const declareRole = (G, ctx, role) => {
  G.chosenRole = role
  G.declarer = ctx.currentPlayer
  G.declaredAt = new Date().getTime()
  ctx.events.setActivePlayers({
    all: 'challenge',
    moveLimit: 1,
  })
  let recentAction = {
    actor: ctx.currentPlayer,
    action: `declared themself ${role}`,
  }
  G.logs = addActionLog(G, recentAction)
}

const endTurn = (G, ctx) => {
  ctx.events.endTurn()
}

export const Masquerade = {
  name: 'masquerade',
  setup: (ctx) => {
    const roles = setupRoles(ctx.numPlayers)
    const gameState = {
      roles,
      originalRoles: { ...roles },
      roleList: roleSets[ctx.numPlayers],
      scores: setupScores(ctx.numPlayers),
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
      logs: [null, null, null],
    }

    return gameState
  },

  phases: {
    resolveRole: {
      turn: {
        order: {
          first: (G) => {
            if (G.noValidRolePlayer) {
              return Number(G.declarer)
            }
            let player
            const { rolePlayers } = getRolePlayers(G)
            player = rolePlayers[0]
            return Number(player)
          },
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
      },
      moves: {
        chooseTarget,
        finishRolePhase,
      },
      onEnd: (G, ctx) => {
        G.playersToPenalize.forEach((p) => {
          G.scores[p]--
          G.coinsOnCourt++
        })
        G.playersToPenalize = []
        G.playersToShow = []
        G.chosenRole = null
        G.chosenAction = null
        G.roleTarget = null
        G.declarer = null
        G.noValidRolePlayer = false
      },
    },
  },

  turn: {
    onBegin: (G, ctx) => {
      G.nextPlayer = getNextPlayer(G, ctx)
      G.challengingPlayers = []
      if (G.revealedPlayers.includes(ctx.currentPlayer)) {
        G.playerMustSwap = true
        G.revealedPlayers = []
      } else {
        G.playerMustSwap = false
      }
    },

    onEnd: (G, ctx) => {
      G.swapTarget = null
      G.chosenAction = null
      if (G.challengingPlayers.length > 0) {
        G.revealedPlayers = [G.declarer, ...G.challengingPlayers]
      }
      G.playerMustSwap = false
      G.declaredAt = null
    },

    order: {
      first: (G) => {
        return G.nextPlayer
      },
      next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
    },
    stages: {
      challenge: {
        moves: {
          respond: challengeRespond,
          forceResolve,
        },
      },
    },
  },

  moves: {
    lookAtCard,
    chooseAction,
    chooseSwapTarget,
    performSwap,
    declareRole,
    endTurn,
  },
  endIf: (G) => {
    if (G.winner) {
      return {
        winner: G.winner,
      }
    }
    const winner = gameHasWinner(G)
    if (winner) {
      return {
        winner: winner,
      }
    }
  },
}
