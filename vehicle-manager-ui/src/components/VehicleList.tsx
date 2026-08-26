import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FocusEvent } from 'react'
import './VehicleList.css'

export type Vehicle = {
  id: string
  label: string
  type: string
  transitAgencyId: string
  capacity: number
}

type EditableField = Exclude<keyof Vehicle, 'id'>

type VehicleListProps = {
  vehicles: Vehicle[]
  onSave: (vehicle: Vehicle) => void | Promise<void>
  onDelete: (vehicle: Vehicle) => void | Promise<void>
}

const fields: { key: EditableField; label: string; inputMode?: 'numeric' }[] = [
  { key: 'label', label: 'Name' },
  { key: 'type', label: 'Vehicle Type' },
  { key: 'transitAgencyId', label: 'Transit Agency Id' },
  { key: 'capacity', label: 'Capacity', inputMode: 'numeric' },
]

export function VehicleList({ vehicles, onSave, onDelete }: VehicleListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Vehicle | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const draftRef = useRef(draft)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedId) ?? null
  const isBusy = isSaving || isDeleting
  const hasChanges = (original: Vehicle, current: Vehicle) => (
    original.label !== current.label
    || original.type !== current.type
    || original.transitAgencyId !== current.transitAgencyId
    || original.capacity !== current.capacity
  )

  const saveDraft = async () => {
    const currentDraft = draftRef.current
    if (!currentDraft || isBusy) return false

    const originalVehicle = vehicles.find((vehicle) => vehicle.id === currentDraft.id)
    if (!originalVehicle || !hasChanges(originalVehicle, currentDraft)) {
      setDraft(null)
      setSelectedId(null)
      return false
    }

    setIsSaving(true)
    try {
      await onSave(currentDraft)
      setDraft(null)
      setSelectedId(null)
      return true
    } finally {
      setIsSaving(false)
    }
  }

  const selectRow = async (vehicle: Vehicle) => {
    if (isBusy || vehicle.id === selectedId) return

    if (selectedId !== null) {
      await saveDraft()
    }

    setSelectedId(vehicle.id)
    setDraft({ ...vehicle })
  }

  const updateField = (field: EditableField, event: ChangeEvent<HTMLInputElement>) => {
    if (!draft || isBusy) return

    const value = field === 'capacity' ? Number(event.target.value) : event.target.value
    setDraft({ ...draft, [field]: value })
  }

  const deselectIfOutside = async (event: FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget
    if (!nextFocusedElement || !listRef.current?.contains(nextFocusedElement as Node)) {
      await saveDraft()
    }
  }

  const deleteSelected = async () => {
    const vehicleToDelete = draft ?? selectedVehicle
    if (!vehicleToDelete || isBusy) return

    setIsDeleting(true)
    try {
      await onDelete(vehicleToDelete)
      setDraft(null)
      setSelectedId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      ref={listRef}
      className="vehicle-list"
      onBlur={deselectIfOutside}
    >
      <div className="vehicle-list__title-row">
        <h1>Your Vehicles</h1>
        <button
          type="button"
          className="vehicle-list__delete"
          onClick={deleteSelected}
          disabled={!selectedVehicle || isBusy}
          aria-label={selectedVehicle ? `Delete ${selectedVehicle.label}` : 'Delete selected vehicle'}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="vehicle-list__table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Select</span></th>
              {fields.map((field) => <th key={field.key} scope="col">{field.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const isSelected = vehicle.id === selectedId
              const rowVehicle = isSelected && draft ? draft : vehicle

              return (
                <tr
                  key={vehicle.id}
                  className={isSelected ? 'is-selected' : ''}
                  onClick={() => selectRow(vehicle)}
                  aria-selected={isSelected}
                >
                  <td className="vehicle-list__selector-cell">
                    <input
                      type="radio"
                      name="selected-vehicle"
                      checked={isSelected}
                      onChange={() => void selectRow(vehicle)}
                      onClick={(event) => event.stopPropagation()}
                      disabled={isBusy}
                      aria-label={`Select ${vehicle.label}`}
                    />
                  </td>
                  {fields.map((field) => (
                    <td key={field.key}>
                      <input
                        type={field.key === 'capacity' ? 'number' : 'text'}
                        inputMode={field.inputMode}
                        value={rowVehicle[field.key]}
                        onChange={(event) => updateField(field.key, event)}
                        onClick={(event) => {
                          event.stopPropagation()
                          void selectRow(vehicle)
                        }}
                        disabled={!isSelected || isBusy}
                        aria-label={`${field.label} for ${vehicle.label}`}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isSaving && <p className="vehicle-list__status" role="status">Saving changes...</p>}
    </div>
  )
}
