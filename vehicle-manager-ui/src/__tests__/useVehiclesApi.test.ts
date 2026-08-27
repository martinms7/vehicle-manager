import {
  addVehicle,
  deleteVehicleById,
  getVehiclesById,
  updateVehicle,
  mapVehicleToVehicleDto,
} from '../hooks/api/useVehiclesApi'
import type { Vehicle } from '../types/Vehicle'
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('useVehiclesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('gets DTOs and maps them to Vehicle domain objects', async () => {
    const dto = {
      vehicleId: 'vehicle-1',
      name: 'Route 1',
      vehicleType: 'bus',
      agencyId: 2,
      seatingCapacity: 50,
    }
      jest.spyOn(global, 'fetch').mockResolvedValue({
          ok: true,
          json: async () => [dto],
      } as Response)

    await expect(getVehiclesById(2)).resolves.toEqual([{
      id: 'vehicle-1',
      label: 'Route 1',
      type: 'bus',
      transitAgencyId: '2',
      capacity: 50,
    }])
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/vehicles?agencyId=2')
  })

  it('maps a Vehicle domain object to a VehicleDto', () => {
    expect(mapVehicleToVehicleDto({
      id: 'vehicle-1',
      label: 'Route 1',
      type: 'bus',
      transitAgencyId: '2',
      capacity: 50,
    })).toEqual({
      vehicleId: 'vehicle-1',
      name: 'Route 1',
      vehicleType: 'bus',
      agencyId: 2,
      seatingCapacity: 50,
    })
  })

  it.each([
    [1, 'bos-101', 'Boston 101'],
    [2, 'nyc-101', 'NYC 101'],
    [3, 'dc-101', 'DC 101'],
  ])('returns mock vehicles for agency %s when the request fails', async (agencyId, id, label) => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'))

    const vehicles = await getVehiclesById(agencyId)

    expect(vehicles[0]).toMatchObject({ id, label })
  })

  it('sends create, update, and delete requests', async () => {
    const vehicle: Vehicle = {
      id: 'vehicle-1',
      label: 'Route 1',
      type: 'bus',
      transitAgencyId: '2',
      capacity: 50,
    }
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValue({
  ok: true,
  json: async () => [vehicle],
} as Response)

    await addVehicle(vehicle)
    await updateVehicle(vehicle)
    await deleteVehicleById(vehicle.id)

    const expectedDto = {
      vehicleId: 'vehicle-1',
      name: 'Route 1',
      vehicleType: 'bus',
      agencyId: 2,
      seatingCapacity: 50,
    }
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/v1/vehicles', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(expectedDto),
    }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/v1/vehicles/vehicle-1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(expectedDto),
    }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:8080/api/v1/vehicles/vehicle-1', expect.objectContaining({ method: 'DELETE' }))
  })
})
