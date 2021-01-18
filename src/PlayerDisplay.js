import _ from 'lodash'

const PlayerDisplay = ({ playerID, ctx, G, playerNames }) => {
  return (
    <>
      <div className="row">
        {_.map(G.originalRoles, (val, key) => {
          const currentPlayer = ctx.currentPlayer === key
          return (
            <div className="col-6 col-md-3 p-2" key={`player-${key}`}>
              <div className="card shadow text-center bg-gray p-2">
                <p className={currentPlayer ? 'text-bold' : ''}>{playerNames[key]} </p>
                {G.scores[key] && <p>Treasure: {G.scores[key]}</p>}
                <p>{val}</p>
              </div>
            </div>
          )
        })}
        <div className="col-6 col-md-3 p-2">
          <div className="card shadow text-center bg-gray p-2">
            <p>Courthouse</p>
            <p>Treasure: {G.coinsOnCourt}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default PlayerDisplay
