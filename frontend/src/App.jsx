import { useState } from 'react'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Customers from './pages/Customers'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import {Deal} from './components/index.js'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Layout />}>
          <Route path='' element={<Dashboard />} />
          <Route path='/leads' element={<Leads />} />
          <Route path='/deals' element={<Deal />} />
          <Route path='/customers' element={<Customers />} />
          <Route path='/reports' element={<Reports />} />
      </Route>

      <Route path='/settings' element={<Settings />} />
    </>
  )
)


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
