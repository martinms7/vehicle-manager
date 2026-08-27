import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Vehicles } from '../components/Vehicles'
import type { Vehicle } from '../types/Vehicle'
import { expect, jest } from '@jest/globals'

const loadedVehicles: Vehicle[] = [{
  id: 'vehicle-2',
  label: 'NYC 2',
  type: 'bus',
  transitAgencyId: '2',
  capacity: 50,
}]

const renderVehicles = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/?id=2']}>
        <Vehicles />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Vehicles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(global.fetch).mockImplementation(async (input, init) => {
      const method = init?.method ?? 'GET'
      if (method === 'GET') {
        return {
          ok: true,
          json: async () => [{
          vehicleId: 'vehicle-2',
          name: 'NYC 2',
          vehicleType: 'bus',
          agencyId: 2,
          seatingCapacity: 50,
          }],
        } as Response
      }
      return {
        ok: true,
        json: async () => loadedVehicles[0],
      } as Response
    })
  })

  it('loads vehicles for the agency in the URL', async () => {
    renderVehicles()

    expect(await screen.findByDisplayValue('NYC 2')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/vehicles/2')
  })

  it('uses the API boundary for adding a vehicle', async () => {
    const user = userEvent.setup()
    renderVehicles()

    await screen.findByDisplayValue('NYC 2')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/vehicles', expect.objectContaining({ method: 'POST' })))
  })

  it('uses the API boundary for updating and deleting a vehicle', async () => {
    const user = userEvent.setup()
    renderVehicles()

    const labelInput = await screen.findByDisplayValue('NYC 2')
    await user.click(screen.getByTestId('vehicle-row-vehicle-2'))
    await user.clear(labelInput)
    await user.type(labelInput, 'Updated NYC 2')
    await user.click(document.body)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/vehicles/vehicle-2',
      expect.objectContaining({ method: 'PUT' }),
    ))

    await user.click(screen.getByTestId('vehicle-row-vehicle-2'))
    await user.click(screen.getByRole('button', { name: /delete nyc 2/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/vehicles/vehicle-2', expect.objectContaining({ method: 'DELETE' })))
  })
})
