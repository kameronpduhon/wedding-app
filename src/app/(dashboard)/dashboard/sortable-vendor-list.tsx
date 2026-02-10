'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getCategoryIcon, getCategoryLabel, ArrowRightIcon } from '@/components/icons'
import { updateVendorPositions } from './actions'

interface Vendor {
  id: string
  name: string
  category: string
  contact_name: string | null
  requests?: { status: string }[]
}

interface SortableVendorListProps {
  initialVendors: Vendor[]
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    none: 'bg-gray-100 text-gray-600',
    pending: 'bg-[#FDF6E3] text-[#96792A]',
    viewed: 'bg-[#E8F0E9] text-[#5C7C65]',
    completed: 'bg-[#5C7C65] text-white',
  }
  
  const labels: Record<string, string> = {
    none: 'No request',
    pending: 'Pending',
    viewed: 'Viewed',
    completed: 'Received',
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.none}`}>
      {labels[status] || 'No request'}
    </span>
  )
}

function SortableVendorItem({ vendor }: { vendor: Vendor }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vendor.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const latestRequest = vendor.requests?.[0]
  const status = latestRequest?.status || 'none'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center border-b border-gray-100 last:border-b-0 ${isDragging ? 'bg-gray-50' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="3" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="4" cy="13" r="1.5" />
          <circle cx="10" cy="3" r="1.5" />
          <circle cx="10" cy="8" r="1.5" />
          <circle cx="10" cy="13" r="1.5" />
        </svg>
      </div>

      {/* Vendor Link */}
      <Link 
        href={`/vendors/${vendor.id}`}
        className="flex-1 p-5 pl-0 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65]">
            {getCategoryIcon(vendor.category, { size: 20 })}
          </div>
          <div>
            <p className="font-medium text-gray-900">{vendor.name}</p>
            <p className="text-sm text-gray-500">
              {getCategoryLabel(vendor.category)}
              {vendor.contact_name && ` • ${vendor.contact_name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#5C7C65]">
            View
            <ArrowRightIcon size={14} />
          </span>
        </div>
      </Link>
    </div>
  )
}

export function SortableVendorList({ initialVendors }: SortableVendorListProps) {
  const [vendors, setVendors] = useState(initialVendors)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = vendors.findIndex((v) => v.id === active.id)
      const newIndex = vendors.findIndex((v) => v.id === over.id)

      const newVendors = arrayMove(vendors, oldIndex, newIndex)
      setVendors(newVendors)

      // Save new order to database
      await updateVendorPositions(newVendors.map((v) => v.id))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={vendors.map((v) => v.id)} strategy={verticalListSortingStrategy}>
        <div>
          {vendors.map((vendor) => (
            <SortableVendorItem key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
