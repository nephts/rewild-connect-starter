import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './pages/App'
import { Dashboard } from './pages/Dashboard'
import { Locations } from './pages/Locations'
import { Shifts } from './pages/Shifts'
import { Messages } from './pages/Messages'
import { Photos } from './pages/Photos'
import { Admin } from './pages/Admin'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'locations', element: <Locations /> },
      { path: 'shifts', element: <Shifts /> },
      { path: 'messages', element: <Messages /> },
      { path: 'photos', element: <Photos /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)