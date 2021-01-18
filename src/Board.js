import React, { useState } from 'react'
import _ from 'lodash'

import { settings } from './config'
import {
  getValidBishopTargets,
  swapRequired,
  getPlayersToReveal,
  roleNeedsTarget,
  shouldWaitToForce,
  displayAction,
  getActionString,
} from './utils'
import PlayerDisplay from './PlayerDisplay'

const Board = (props) => {
  const { playerID, ctx, G, moves, playerNames } = props
  const [waitToForce, setWaitToForce] = useState(false)

  const RevealedPlayersDisplay = (props) => {
    const { playerID, ctx, G } = props
    const revealed = getPlayersToReveal(G)
    return (
      <>
        <div className="row">
          {_.map(revealed, (key) => {
            return (
              <div className="p-3 col-3" key={`revealed-${key}`}>
                <div className="card shadow text-center bg-gray p-3">
                  <p>{playerNames[key]} </p>
                  <p>{G.roles[key]}</p>
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const ChallengeDisplay = (props) => {
    const { playerID, ctx, G, moves } = props

    return (
      <>
        <div className="row">
          <h2>
            {playerNames[ctx.currentPlayer]} is claiming {G.chosenRole}
          </h2>
        </div>
        <div className="row">
          <div className="col-4 pb-3">
            <button className="btn btn-outline-dark" onClick={() => moves.respond('challenge')}>
              Challenge!
            </button>
          </div>
          <div className="col-4 pb-3">
            <button className="btn btn-outline-dark" onClick={() => moves.respond('allow')}>
              Allow!
            </button>
          </div>
        </div>
      </>
    )
  }

  const SwapDisplay = (props) => {
    return (
      <div className="row">
        {G.swapTarget === null ? (
          <>
            <div className="row">
              <div className="col">
                <h4>Swap with:</h4>
              </div>
            </div>
            <div className="row">
              {_.map(G.roles, (val, key) => {
                if (key !== playerID) {
                  return (
                    <div key={`swap-${key}`} className="col-4 pb-4">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => {
                          onChooseSwap(key)
                        }}
                        key={key}
                      >
                        {playerNames[key]}
                      </button>
                    </div>
                  )
                }
              })}
            </div>
          </>
        ) : (
          <>
            <div className="row pb-3">
              <div className="col">
                <h4>Swap cards with {playerNames[G.swapTarget]}?</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-6 col-md-4">
                <button className="btn btn-outline-dark" onClick={() => moves.performSwap(true)}>
                  Yes, really swap
                </button>
              </div>
              <div className="col-6 col-md-4">
                <button className="btn btn-outline-dark" onClick={() => moves.performSwap(false)}>
                  No, keep my own card
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const resolveRole = () => {
    if (['king', 'queen', 'cheat', 'judge', 'widow', 'thief'].includes(G.chosenRole)) {
      return moves.finishRolePhase()
    }
    if (['bishop', 'witch'].includes(G.chosenRole)) {
      if (G.roleTarget !== null) {
        return moves.finishRolePhase()
      }
      console.log('No target chosen')
    }
  }

  const onChooseAction = (action) => {
    let actionLog = ''
    if (action === 'look') {
      actionLog = `${playerNames[ctx.currentPlayer]} looked at their card`
    }
    moves.chooseAction(action, actionLog)
  }

  const onChooseSwap = (target) => {
    moves.chooseSwapTarget(target)
  }

  const onChooseRoleTarget = (target) => {
    moves.chooseTarget(target)
  }

  const ChoicesDisplay = ({ G }) => {
    const role = G.chosenRole
    switch (role) {
      case 'bishop':
        const bishopTargets = getValidBishopTargets(G, playerID)
        return (
          <>
            <h3>Choose who to steal from:</h3>
            {bishopTargets.map((t) => {
              const isTarget = G.roleTarget === t
              return (
                <div className="col-3" key={t}>
                  <button
                    className={`btn btn-outline-dark ${isTarget ? 'active' : ''}`}
                    onClick={() => onChooseRoleTarget(t)}
                  >
                    {isTarget && '*'}
                    {playerNames[t]}
                    {isTarget && '*'}
                  </button>
                </div>
              )
            })}
          </>
        )

      case 'witch':
        const otherPlayers = _.omit(G.scores, playerID)
        return (
          <>
            <h3>Choose who you want to swap fortunes with:</h3>
            {Object.keys(otherPlayers).map((t) => {
              return (
                <div className="col-3" key={t}>
                  <button className="btn btn-outline-dark" onClick={() => onChooseRoleTarget(t)}>
                    {playerNames[t]} -- {G.scores[t]} coins
                  </button>
                </div>
              )
            })}
          </>
        )

      default:
        return null
    }
  }

  if (ctx.gameover) {
    return (
      <>
        <h2>Game Over!</h2>
        <div>Winner: {playerNames[ctx.gameover.winner]}</div>
        <PlayerDisplay {...props} />
      </>
    )
  }

  if (G.noValidRolePlayer) {
    return (
      <div className="container">
        <h3>Nobody was the {G.chosenRole}</h3>
        <RevealedPlayersDisplay G={G} />
        {ctx.currentPlayer === playerID && (
          <div className="row">
            <button
              className="btn btn-outline-dark"
              onClick={() => {
                console.log('click ok')
                moves.finishRolePhase()
              }}
            >
              Okay, end turn
            </button>
          </div>
        )}
      </div>
    )
  }

  if (ctx.phase === 'resolveRole') {
    if (ctx.currentPlayer === playerID) {
      let resolveButtonText = 'Resolve'
      if (G.chosenRole === 'witch') {
        resolveButtonText = 'Swap fortunes'
      }
      if (G.chosenRole === 'bishop') {
        resolveButtonText = 'Take two coins from target'
      }
      if (G.chosenRole === 'king') {
        resolveButtonText = 'Take 3 coins from bank'
      }
      if (G.chosenRole === 'queen') {
        resolveButtonText = 'Take 2 coins from bank'
      }
      if (G.chosenRole === 'judge') {
        resolveButtonText = `Take ${G.coinsOnCourt} coins from courthouse`
      }
      if (G.chosenRole === 'cheat') {
        if (G.scores[ctx.currentPlayer] >= 10) {
          resolveButtonText = `Win the game`
        } else {
          resolveButtonText = `Do nothing`
        }
      }
      const canResolve = !roleNeedsTarget(G.chosenRole) || G.roleTarget !== null
      return (
        <div className="container">
          <h3>
            You are playing as {G.chosenRole}! You have {G.scores[playerID]} coins.
          </h3>
          <div className="row">
            <ChoicesDisplay G={G} />
          </div>
          {canResolve && (
            <div className="row">
              <div className="col">
                <button className="btn btn-outline-dark" onClick={resolveRole}>
                  {resolveButtonText}
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
    return (
      <p>
        Waiting for the {G.chosenRole} ({playerNames[ctx.currentPlayer]}) to play...
      </p>
    )
  }

  const actionOptions = swapRequired(G, ctx) ? ['swap'] : ['roleplay', 'swap', 'look']

  return (
    <div className="container">
      <p className="status-bar">
        You are: {playerNames[playerID]} {ctx.currentPlayer == playerID && "(it's your turn)"}
      </p>
      <>
        {ctx.currentPlayer == playerID && G.chosenAction === null && (
          <>
            <div className="row pt-4">
              <div className="col pb-3">
                <h4>Choose your action:</h4>
              </div>
            </div>
            <div className="row">
              {actionOptions.map((action) => {
                return (
                  <div className="col-4 col-md-2 pb-3" key={`${action}-button`}>
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => onChooseAction(action)}
                      key={`btn-${action}`}
                    >
                      {action}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {ctx.currentPlayer == playerID && G.chosenAction === 'look' && (
          <div className="row pt-4">
            <div className="col-3">
              <div className="card text-center p-4 shadow">Your role: {G.roles[playerID]}</div>
            </div>

            <div className="col-4 pb-3">
              <button className="btn btn-outline-dark" onClick={() => moves.endTurn()}>
                Okay, end turn
              </button>
            </div>
          </div>
        )}

        {ctx.currentPlayer == playerID && G.chosenAction === 'roleplay' && (
          <>
            {G.chosenRole ? (
              <>
                <h2>Waiting for others to challenge</h2>
                {waitToForce ? (
                  <button className="btn btn-outline-dark disabled">Force Resolve (wait)</button>
                ) : (
                  <button className="btn btn-outline-dark" onClick={() => moves.forceResolve()}>
                    Force Resolve
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="row">
                  <div className="col">
                    <h4>Choose your role:</h4>
                  </div>
                </div>
                <div className="row">
                  {G.roleList.map((r, i) => {
                    return (
                      <div className="col-4 pb-3" key={`role-${i}`}>
                        <button
                          className="btn btn-outline-dark"
                          onClick={() => {
                            moves.declareRole(r)
                            setWaitToForce(true)
                            window.setTimeout(() => {
                              setWaitToForce(false)
                            }, settings.secondsBeforeForceAllowed * 1000)
                          }}
                          key={i}
                        >
                          {r}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {ctx.currentPlayer == playerID && G.chosenAction === 'swap' && <SwapDisplay {...props} />}

        <hr />

        {ctx.currentPlayer != playerID && G.chosenRole !== null && <ChallengeDisplay {...props} />}

        <PlayerDisplay {...props} />
        <div className="row">
          {ctx.activePlayers && (
            <div className="col">
              Waiting for:{' '}
              {Object.keys(ctx.activePlayers).map((k) => {
                return `${playerNames[k]}, `
              })}
            </div>
          )}
        </div>
        {G.currentAction && <p>Current Action: {G.currentAction}</p>}
      </>
      <div className="row">
        <p>Last actions:</p>
        {G.logs && (
          <ul>
            {G.logs.map((log, i) => {
              if (!log) {
                return null
              }
              return <li key={`log-${i}`}>{getActionString(log, playerNames)}</li>
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Board
