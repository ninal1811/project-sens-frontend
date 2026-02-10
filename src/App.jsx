import './App.css'
import { Routes, Route, Link } from 'react-router'
import States from './Components/States/States'

function Home() {
  return (
    <div>
      <h1>project-sens</h1>
      <Link to='/States'>View States</Link>
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
