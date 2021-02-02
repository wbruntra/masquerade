test('having no challengers makes it your turn to play', () => {
  const MasqueradeScenario = {
    ...Masquerade,
    setup: (ctx) => {
      ctx.events.setPhase('resolveRole')
      return {
        ...neutralGameState,
        declarer: '2',
        chosenRole: 'king',
      }
    },
  }

  const client = Client({
    game: MasqueradeScenario,
    numPlayers: 4,
  })
  const { G, ctx } = client.store.getState()

  expect(ctx.currentPlayer).toBe('2')
})

test('a successful challenge makes it your turn', () => {
  // TODO: FIX this
  const MasqueradeScenario = {
    ...Masquerade,
    setup: (ctx) => {
      // ctx.events.setPhase('resolveRole')
      return {
        ...neutralGameState,
        chosenRole: 'king',
        roles: {
          0: 'queen',
          3: 'king',
        },
        declarer: '0',
        challengingPlayers: ['3'],
      }
    },
  }
  const client = Client({
    game: MasqueradeScenario,
    numPlayers: 4,
  })

  // client.moves.forceResolve()

  const { G, ctx } = client.store.getState()
  // console.log(G)
  // expect(ctx.currentPlayer).toBe('3')
})

test('swap works', () => {
  const MasqueradeScenario = {
    ...Masquerade,
    setup: (ctx) => {
      return {
        ...neutralGameState,
        chosenRole: 'swap',
        roles: {
          0: 'queen',
          3: 'king',
        },
        swapTarget: '3',
      }
    },
  }
  const client = Client({
    game: MasqueradeScenario,
    numPlayers: 4,
    playerID: '0',
  })

  client.moves.performSwap(true)

  const { G, ctx } = client.store.getState()
  expect(G.roles['0']).toBe('king')
})

test('not swapping works', () => {
  const MasqueradeScenario = {
    ...Masquerade,
    setup: (ctx) => {
      return {
        ...neutralGameState,
        chosenRole: 'swap',
        roles: {
          0: 'queen',
          3: 'king',
        },
        swapTarget: '3',
      }
    },
  }
  const client = Client({
    game: MasqueradeScenario,
    numPlayers: 4,
    playerID: '0',
  })

  client.moves.performSwap(false)

  const { G, ctx } = client.store.getState()
  expect(G.roles['0']).toBe('queen')
})

// end2end

test('4-player game', () => {
  let ctx, G

  const MasqueradeScenario = {
    ...Masquerade,
    setup: (ctx) => {
      return {
        ...neutralGameState,
        roles: {
          0: 'queen',
          1: 'judge',
          2: 'bishop',
          3: 'king',
          mid_1: 'thief',
          mid_2: 'cheat',
        },
      }
    },
  }

  let moveResult

  const players = [0, 1].map((p) => {
    return Client({
      game: MasqueradeScenario,
      numPlayers: 4,
      multiplayer: Local(),
      playerID: '0',
    })
  })

  players.forEach((p) => p.start())

  players[0].moves.declareRole('king') // can't declare role, only swap
  ;({ ctx, G } = players[0].store.getState())
  expect(ctx.activePlayers).toEqual(null)
  console.log(ctx)
})
