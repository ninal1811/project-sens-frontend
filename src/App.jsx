import './App.css'
import { Routes, Route, Link } from 'react-router'
import MapView from './Components/MapView'

function Home() {
  return (
    <div>
      <h1>project-sens</h1>
      <MapView />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path='/' element={ <Home/> }></Route>
      <Route path='/States' element={ <States/> }></Route>
    </Routes>
  )
}

export default App
