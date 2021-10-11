const MainContainer = (props) => {
  return (
    <div className="container main mt-4 bg-white p-4 shadow rounded">
      {props.children}
    </div>
  )
}

export default MainContainer
