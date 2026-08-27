import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { VehicleList } from '../components/VehicleList'
import type { Vehicle } from '../types/Vehicle'
import { describe, expect, it, jest } from '@jest/globals';

const vehicles: Vehicle[] = [{
  id: 'vehicle-1',
  label: 'Route 1',
  type: 'bus',
  transitAgencyId: 'agency-1',
  capacity: 50,
}]

describe('VehicleList', () => {
  it('selects a row and enables its fields when the row is clicked', async () => {
    const user = userEvent.setup()
    render(<VehicleList vehicles={vehicles} onAdd={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} />)

    const labelInput = screen.getByRole('textbox', { name: /name for route 1/i })
    expect(labelInput).toBeDisabled()

    await user.click(screen.getByRole('row', { name: /route 1 bus agency-1 50/i }))

    expect(labelInput).toBeEnabled()
    expect(screen.getByRole('radio', { name: /select route 1/i })).toBeChecked()
  })

  it('saves an edited row only after it is deselected', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(
      <VehicleList
        vehicles={vehicles}
        onAdd={jest.fn()}
        onSave={onSave}
        onDelete={jest.fn()}
      />,
    )

    await user.click(screen.getByRole('row', { name: /route 1 bus agency-1 50/i }))
    await user.clear(screen.getByRole('textbox', { name: /name for route 1/i }))
    await user.type(screen.getByRole('textbox', { name: /name for route 1/i }), 'Updated Route')
    await user.click(document.body)

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      ...vehicles[0],
      label: 'Updated Route',
    }))
  })

  it('adds a selected editable row with the bus default capacity', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn().mockResolvedValue(undefined)
    function VehicleListHarness() {
      const [harnessVehicles, setHarnessVehicles] = useState<Vehicle[]>([])
      const handleAdd = async (vehicle: Vehicle) => {
        await onAdd(vehicle)
        setHarnessVehicles((currentVehicles) => [...currentVehicles, vehicle])
      }

      return (
        <VehicleList
          vehicles={harnessVehicles}
          onAdd={handleAdd}
          onSave={jest.fn()}
          onDelete={jest.fn()}
        />
      )
    }

    render(<VehicleListHarness />)

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      label: 'New Vehicle',
      type: 'bus',
      capacity: 50,
    })))
    expect(screen.getByRole('radio', { name: /select new vehicle/i })).toBeChecked()
    expect(screen.getByRole('textbox', { name: /name for new vehicle/i })).toBeEnabled()
  })

  it('updates capacity when the vehicle type changes', async () => {
    const user = userEvent.setup()
    render(<VehicleList vehicles={vehicles} onAdd={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} />)

    await user.click(screen.getByTestId('vehicle-row-vehicle-1'))
    await user.selectOptions(screen.getByTestId('vehicle-vehicle-1-type'), 'train')

    expect(screen.getByTestId('vehicle-vehicle-1-capacity')).toHaveValue(700)
  })

  it('deletes the selected row', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn().mockResolvedValue(undefined)
    render(<VehicleList vehicles={vehicles} onAdd={jest.fn()} onSave={jest.fn()} onDelete={onDelete} />)

    await user.click(screen.getByRole('row', { name: /route 1 bus agency-1 50/i }))
    await user.click(screen.getByRole('button', { name: /delete route 1/i }))

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(vehicles[0]))
  })
})
