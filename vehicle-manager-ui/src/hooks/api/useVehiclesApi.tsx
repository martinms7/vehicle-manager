import type { Vehicle } from "../../types/Vehicle"

export type VehicleDto = {
  vehicleId: string
  name: string
  vehicleType: string
  agencyId: number
  seatingCapacity: number
}

const mockVehicleDtos: Record<number, VehicleDto[]> = {
  1: [
    { vehicleId: 'bos-101', name: 'Boston 101', vehicleType: 'bus', agencyId: 1, seatingCapacity: 50 },
    { vehicleId: 'bos-202', name: 'Boston 202', vehicleType: 'streetcar', agencyId: 1, seatingCapacity: 150 },
  ],
  2: [
    { vehicleId: 'nyc-101', name: 'NYC 101', vehicleType: 'bus', agencyId: 2, seatingCapacity: 50 },
    { vehicleId: 'nyc-202', name: 'NYC 202', vehicleType: 'train', agencyId: 2, seatingCapacity: 700 },
  ],
  3: [
    { vehicleId: 'dc-101', name: 'DC 101', vehicleType: 'ferry', agencyId: 3, seatingCapacity: 500 },
    { vehicleId: 'dc-202', name: 'DC 202', vehicleType: 'bus', agencyId: 3, seatingCapacity: 50 },
  ],
}

    export const mapVehicleDtoToVehicle = (vehicleDto: VehicleDto): Vehicle => ({
      id: vehicleDto.vehicleId,
      label: vehicleDto.name,
      type: vehicleDto.vehicleType,
      transitAgencyId: String(vehicleDto.agencyId),
      capacity: vehicleDto.seatingCapacity,
    });

    export const mapVehicleToVehicleDto = (vehicle: Vehicle): VehicleDto => ({
      vehicleId: vehicle.id,
      name: vehicle.label,
      vehicleType: vehicle.type,
      agencyId: Number(vehicle.transitAgencyId),
      seatingCapacity: vehicle.capacity,
    });

    const vehiclesEndpoint: string = "http://localhost:8080/api/v1/vehicles";
    
    const getMockVehicleDtos = async (agencyId: number): Promise<VehicleDto[]> => (
      mockVehicleDtos[agencyId] ?? []
    );
    
    // const getVehicleDtos = async (agencyId: number): Promise<VehicleDto[]> => {
    //   try {
    //     const response = await fetch(`/api/vehicles?agencyId=${agencyId}`)
    //     if (!response.ok) throw new Error(`Vehicle request failed: ${response.status}`)
    //     return await response.json() as VehicleDto[]
    //   } catch {
    //     return getMockVehicleDtos(agencyId)
    //   }
    // }

export async function getVehiclesById (agencyId: number): Promise<Vehicle[]> {
      try {
        const response = await fetch(`${vehiclesEndpoint}?agencyId=${agencyId}`)
        if (!response.ok) throw new Error(`Vehicle request failed: ${response.status}`)
        const vehicleDtos = await response.json() as VehicleDto[];
        const vehicles = vehicleDtos.map(mapVehicleDtoToVehicle);
        return vehicles;
      } catch (error) {
        return (await getMockVehicleDtos(agencyId)).map(mapVehicleDtoToVehicle)
      }

    // const retrievedVehicles = agencyId ? (await getVehicleDtos(agencyId)).map(mapVehicleDto) : [];


    // return retrievedVehicles;//{ vehicles, setVehicles, isLoading, error }
}


export async function addVehicle(vehicle: Vehicle): Promise<Vehicle[]> {
  try {
    const response = await fetch(`${vehiclesEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapVehicleToVehicleDto(vehicle)),
    });
    if (!response.ok) throw new Error(`Vehicle creation failed: ${response.status}`);
      const vehicleDtos = await response.json() as VehicleDto[];
      const vehicles = vehicleDtos.map(mapVehicleDtoToVehicle);
      return vehicles;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
}

export async function updateVehicle(vehicle: Vehicle): Promise<Vehicle[]> {
  try {
    const response = await fetch(`${vehiclesEndpoint}/${vehicle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapVehicleToVehicleDto(vehicle)),
    });
    if (!response.ok) throw new Error(`Vehicle update failed: ${response.status}`);
      const vehicleDtos = await response.json() as VehicleDto[];
      const vehicles = vehicleDtos.map(mapVehicleDtoToVehicle);
      return vehicles;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicleById(vehicleId: string): Promise<void> {
  try {
    const response = await fetch(`${vehiclesEndpoint}/${vehicleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Vehicle deletion failed: ${response.status}`);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}