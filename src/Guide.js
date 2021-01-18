const Guide = ({ handleClose }) => {
  return (
    <>
      <h3>Role actions</h3>
      <ul>
        <li>king - 3 coins from the bank</li>
        <li>queen - 2 coins from the bank</li>
        <li>judge - all coins from the courthouse</li>
        <li>cheat - wins the game if 10+ coins</li>
        <li>thief - take 1 coin from each player to left and right</li>
        <li>bishop - take 2 coins from richest player (choose if tied)</li>
        <li>witch - swap fortunes with another player</li>
      </ul>
      <button onClick={handleClose} className="btn btn-outline-dark">
        Back
      </button>
    </>
  )
}

export default Guide
