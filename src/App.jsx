import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import States from './Components/States/States'
import Countries from './Components/Countries/Countries'
import Cities from './Components/Cities/Cities'
import MapView from './Components/MapView'
import NavBar from './Components/NavBar'
import Login from './Components/Login'
import Favorites from './Components/Favorites'
import Register from './Components/Register';

function App() {
  return (
    <Routes>
      <Route path='/' element={<MapView />} />
      <Route path='/States' element={<><NavBar /><States /></>} />
      <Route path='/Countries' element={<><NavBar /><Countries /></>} />
      <Route path='/Cities' element={<><NavBar /><Cities /></>} />
      <Route path='/Login' element={<><NavBar /><Login /></>} />
      <Route path='/Favorites' element={<><NavBar /><Favorites /></>} />
      <Route path="/Register" element={<><NavBar /><Register /></>} />
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App