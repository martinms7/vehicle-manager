import { Vehicles } from './components/Vehicles'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<VehicleList />} />
//   )
// )

function App() {
  
  return (
    <BrowserRouter>
      <main className="app-shell">
        {/* <RouterProvider router={router} /> */}
        <Routes>
          <Route path="/" element={<Vehicles/>}/>
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
