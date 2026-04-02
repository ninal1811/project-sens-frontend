import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import States from './Components/States/States'
import Countries from './Components/Countries/Countries'
import Cities from './Components/Cities/Cities'
import MapView from './Components/MapView'
import NavBar from './Components/NavBar'
import Login from './Components/Login'
import Favorites from './Components/Favorites'

function Home() {
  return (
    <div className='home-root'>
      <NavBar />
      <MapView />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/States' element={<States />} />
      <Route path='/Countries' element={<Countries />} />
      <Route path='/Cities' element={<Cities />} />
      <Route path='/Login' element={<Login />} />
      <Route path='/Favorites' element={<Favorites />} />
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App