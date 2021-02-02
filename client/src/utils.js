import _ from 'lodash'
import { roleSets, settings } from './config'

const getMax = (object) => {
  return Object.keys(object).filter((x) => {
    return object[x] == Math.max.apply(null, Object.values(object))
  })
}

export const getValidBishopTargets = (G, rolePlayer) => {
  let otherScores = _.omit(G.scores, rolePlayer)
  return getMax(otherScores)
}

export const swapRequired = (G, ctx) => {
  return false
  if (G.playerMustSwap) {
    return true
  }
  // First four turns can only choose swap
  // if (ctx.turn <= 4) {
  //   return true
  // }
  return false
}

export const validRolePlayerExists = (G) => {
  const challengers = [...G.challengingPlayers]
  const role = G.chosenRole
  let playerRole, p

  if (challengers.length === 0) {
    return true
  } else {
    if (G.roles[G.declarer] === role) {
      return G.declarer
    }
    for (let i = 0; i < challengers.length; i++) {
      playerRole = G.roles[challengers[i]]
      if (playerRole === role) {
        return challengers[i]
      }
    }
  }
  return false
}

export const getPlayersToReveal = (G) => {
  return [G.declarer, ...G.challengingPlayers]
}

export const getRolePlayers = (G) => {
  let rolePlayers = []
  let falseClaimants = []
  const challengers = [...G.challengingPlayers]
  const role = G.chosenRole
  const roles = { ...G.roles }
  if (challengers.length === 0) {
    rolePlayers = [G.declarer]
  } else {
    ;[G.declarer, ...challengers].forEach((p) => {
      if (G.roles[p] === role) {
        rolePlayers.push(p)
      } else {
        falseClaimants = [...falseClaimants, p]
      }
    })
  }
  return {
    rolePlayers,
    falseClaimants,
  }
}

export const roleNeedsTarget = (role) => {
  if (['bishop', 'witch'].includes(role)) {
    return true
  }
  return false
}

export const gameHasWinner = (G, coins = 13) => {
  let winner = false
  _.forEach(G.scores, (val, key) => {
    if (val >= coins) {
      winner = key
    }
  })
  return winner
}

export const setupRoles = (numPlayers) => {
  let roles = roleSets[numPlayers]
  roles = _.shuffle(roles)
  const gameRoles = Array(numPlayers)
    .fill(1)
    .reduce((a, b, i) => {
      a[i] = roles[i]
      return a
    }, {})
  if (numPlayers === 4) {
    gameRoles['4'] = roles.slice(-1).shift()
    gameRoles['5'] = roles.slice(-2).shift()
  }
  if (numPlayers === 5) {
    gameRoles['5'] = roles.slice(-1).shift()
  }
  return gameRoles
}

export const setupScores = (numPlayers) => {
  console.log('Setting up for', numPlayers)
  return Array(numPlayers)
    .fill('xxx')
    .reduce((a, b, i) => {
      a[i] = 6
      return a
    }, {})
}

export const shouldWaitToForce = (G) => {
  const timeNow = new Date().getTime()
  const result = (timeNow - G.declaredAt) / 1000 < settings.secondsBeforeForceAllowed
  return result
}

export const displayAction = (G, players) => {
  const { recentAction } = G
  if (!recentAction) {
    return null
  }
  let actionLog
  if (!recentAction.target) {
    actionLog = `${players[recentAction.actor]} ${recentAction.action}`
  } else {
    actionLog = `${players[recentAction.actor]} ${recentAction.action} ${
      players[recentAction.target]
    }`
  }
  return actionLog
}

export const getActionString = (action, players) => {
  if (!action) {
    return null
  }
  let actionLog
  if (!action.target) {
    actionLog = `${players[action.actor]} ${action.action}`
  } else {
    actionLog = `${players[action.actor]} ${action.action} ${players[action.target]}`
  }
  if (action.challengers) {
    actionLog = `${actionLog} (challengers: ${action.challengers.map((p) => players[p]).join(', ')})`
  }
  return actionLog
}

export const getPlayerSlots = (players) => {
  const newPlayers = [...players]
  const humanPlayers = newPlayers.length
  if (humanPlayers < 6) {
    newPlayers.push('Middle 1')
  }
  if (humanPlayers < 5) {
    newPlayers.push('Middle 2')
  }
  return newPlayers
}
