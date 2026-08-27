import { useSearchParams } from 'react-router-dom'
import { VehicleList } from './VehicleList'
import type { Vehicle } from '../types/Vehicle'
import { getVehiclesById, updateVehicle, deleteVehicleById, addVehicle as addVehicleApi } from '../hooks/api/useVehiclesApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// export type VehicleDto = {
//   vehicleId: string
//   name: string
//   vehicleType: string
//   agencyId: number
//   seatingCapacity: number
// }


// const mockVehicleDtos: Record<number, VehicleDto[]> = {
//   1: [
//     { vehicleId: 'bos-101', name: 'Boston 101', vehicleType: 'bus', agencyId: 1, seatingCapacity: 50 },
//     { vehicleId: 'bos-202', name: 'Boston 202', vehicleType: 'streetcar', agencyId: 1, seatingCapacity: 150 },
//   ],
//   2: [
//     { vehicleId: 'nyc-101', name: 'NYC 101', vehicleType: 'bus', agencyId: 2, seatingCapacity: 50 },
//     { vehicleId: 'nyc-202', name: 'NYC 202', vehicleType: 'train', agencyId: 2, seatingCapacity: 700 },
//   ],
//   3: [
//     { vehicleId: 'dc-101', name: 'DC 101', vehicleType: 'ferry', agencyId: 3, seatingCapacity: 500 },
//     { vehicleId: 'dc-202', name: 'DC 202', vehicleType: 'bus', agencyId: 3, seatingCapacity: 50 },
//   ],
// }

// const mapVehicleDto = (vehicleDto: VehicleDto): Vehicle => ({
//   id: vehicleDto.vehicleId,
//   label: vehicleDto.name,
//   type: vehicleDto.vehicleType,
//   transitAgencyId: String(vehicleDto.agencyId),
//   capacity: vehicleDto.seatingCapacity,
// })

// const getMockVehicleDtos = async (agencyId: number): Promise<VehicleDto[]> => (
//   mockVehicleDtos[agencyId] ?? []
// )

// const getVehicleDtos = async (agencyId: number): Promise<VehicleDto[]> => {
//   try {
//     const response = await fetch(`/api/vehicles?agencyId=${agencyId}`)
//     if (!response.ok) throw new Error(`Vehicle request failed: ${response.status}`)
//     return await response.json() as VehicleDto[]
//   } catch {
//     return getMockVehicleDtos(agencyId)
//   }
// }

// export function useVehicles(agencyId: number | null) {
//   const [vehicles, setVehicles] = useState<Vehicle[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     let isCurrentRequest = true

//     if (agencyId === null) {
//       setVehicles([])
//       setError(null)
//       setIsLoading(false)
//       return () => {
//         isCurrentRequest = false
//       }
//     }

//     setIsLoading(true)
//     setError(null)

//     void getVehicleDtos(agencyId)
//       .then((vehicleDtos) => {
//         if (isCurrentRequest) setVehicles(vehicleDtos.map(mapVehicleDto))
//       })
//       .catch(() => {
//         if (isCurrentRequest) setError('Unable to load vehicles.')
//       })
//       .finally(() => {
//         if (isCurrentRequest) setIsLoading(false)
//       })

//     return () => {
//       isCurrentRequest = false
//     }
//   }, [agencyId])

//   return { vehicles, setVehicles, isLoading, error }
// }

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
    // await addVehicleApi(vehicle);
    // await refetch(); // Refetch the vehicles after adding a new one
  }

  const saveVehicle = async (vehicle: Vehicle) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    // setVehicles((currentVehicles) => currentVehicles.map((currentVehicle) => (
    //   currentVehicle.id === vehicle.id ? vehicle : currentVehicle
    // )))
    if(!vehicle.id) {
        await addVehicle(vehicle);
        return;
    }
    await updateVehicle(vehicle);
    refetch(); // Refetch the vehicles after updating one
  }

  const deleteVehicle = async (vehicle: Vehicle) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // setVehicles((currentVehicles) => currentVehicles.filter(({ id }) => id !== vehicle.id))
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
