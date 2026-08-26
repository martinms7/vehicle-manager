import { useState } from 'react'
import { VehicleList, type Vehicle } from './components/VehicleList'
import './App.css'

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'vehicle-101',
      label: 'Swiftly 101',
      type: 'Bus',
      transitAgencyId: 'agency-nyc',
      capacity: 42,
    },
    {
      id: 'vehicle-202',
      label: 'Swiftly 202',
      type: 'Shuttle',
      transitAgencyId: 'agency-bos',
      capacity: 18,
    },
  ])

  const saveVehicle = async (vehicle: Vehicle) => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    setVehicles((currentVehicles) => currentVehicles.map((currentVehicle) => (
      currentVehicle.id === vehicle.id ? vehicle : currentVehicle
    )))
  }

  const deleteVehicle = async (vehicle: Vehicle) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    setVehicles((currentVehicles) => currentVehicles.filter(({ id }) => id !== vehicle.id))
  }

  return (
    <main className="app-shell">
      <VehicleList
        vehicles={vehicles}
        onSave={saveVehicle}
        onDelete={deleteVehicle}
      />
    </main>
  )
}

export default App
