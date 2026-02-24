import './App.css'
import { Routes, Route, Link } from 'react-router'
import States from './Components/States/States'
import Countries from './Components/Countries/Countries'
import MapView from './Components/MapView'

function Home() {
  return (
    <div>
      <h1>project-sens</h1>
      <Link to='/States'>View States</Link>
      <br />
      <Link to='/Countries'>View Countries</Link>
      <MapView/>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path='/' element={ <Home/> }></Route>
      <Route path='/States' element={ <States/> }></Route>
      <Route path='/Countries' element={<Countries />}></Route>
    </Routes>
  )
}

export default App