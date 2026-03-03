import './App.css'
import { Routes, Route, Link } from 'react-router'
import States from './Components/States/States'
import Countries from './Components/Countries/Countries'
import Cities from './Components/Cities/Cities'
import MapView from './Components/MapView'

function Home() {
  return (
    <div>
      <h1>project-sens</h1>

      <div className="nav-buttons">
        <Link to="/States" className="nav-btn">View States</Link>
        <Link to="/Countries" className="nav-btn">View Countries</Link>
        <Link to="/Cities" className="nav-btn">View Cities</Link>
      </div>

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
      <Route path='/Cities' element={<Cities />}></Route>
    </Routes>
  )
}

export default App