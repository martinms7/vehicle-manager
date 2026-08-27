import { useSearchParams } from 'react-router-dom'
import { VehicleList } from './VehicleList'
import type { Vehicle } from '../types/Vehicle'
import { getVehiclesById, updateVehicle, deleteVehicleById, addVehicle as addVehicleApi } from '../hooks/api/useVehiclesApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function Vehicles() {
  const [searchParams] = useSearchParams()
  const parsedAgencyId = Number(searchParams.get('id'))
  // Ensure the agencyId is a valid number between 1 and 3, defaulting to 1 if not specified
  // Quick future increment: update query param in url to match agencyId
  const agencyId = Number.isInteger(parsedAgencyId) && parsedAgencyId >= 1 && parsedAgencyId <= 3
    ? parsedAgencyId
    : 1
//   const { vehicles, setVehicles, isLoading, error } = useVehicles(agencyId)
  const {data:initialVehicles, refetch, isLoading, error} = useQuery({
        queryKey: ['agency', agencyId],
        queryFn: () => getVehiclesById(agencyId),
        enabled: !!agencyId,
    });
  const queryClient = useQueryClient();

  const addVehicle = async (vehicle: Vehicle) => {
    const latestVehicleList = await addVehicleApi(vehicle)
    // setVehicles((currentVehicles) => [...currentVehicles, vehicle])

    //filtering here instead of in the backend for now
    const filteredVehicles = latestVehicleList.filter((v) => v.transitAgencyId === String(agencyId));
    queryClient.setQueryData<Vehicle[]>(['agency', agencyId], filteredVehicles)
  }

  const saveVehicle = async (vehicle: Vehicle) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if(!vehicle.id) {
        await addVehicle(vehicle);
        return;
    }
    await updateVehicle(vehicle);
    refetch(); // Refetch the vehicles after updating one
  }

  const deleteVehicle = async (vehicle: Vehicle) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await deleteVehicleById(vehicle.id);
    refetch(); // Refetch the vehicles after deleting one
  }

  if (isLoading) return <p>Loading vehicles...</p>
  if (error) return <p role="alert">{error.message}</p>

  return (
    <VehicleList
      agencyId={agencyId}
      vehicles={initialVehicles ?? []}
      onAdd={addVehicle}
      onSave={saveVehicle}
      onDelete={deleteVehicle}
    />
  )
}
