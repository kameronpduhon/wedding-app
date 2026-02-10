// Database types for Supabase

export type VendorCategory =
  | 'photographer'
  | 'videographer'
  | 'caterer'
  | 'florist'
  | 'dj'
  | 'band'
  | 'cake'
  | 'venue'
  | 'planner'
  | 'officiant'
  | 'hair_makeup'
  | 'dress'
  | 'suit'
  | 'transportation'
  | 'rentals'
  | 'invitations'
  | 'other'

export type RequestStatus = 'pending' | 'viewed' | 'completed'

export type FileType = 'invoice' | 'contract' | 'other'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Wedding {
  id: string
  user_id: string
  partner1_name: string
  partner2_name: string | null
  wedding_date: string | null
  venue_name: string | null
  venue_address: string | null
  budget: number | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  wedding_id: string
  name: string
  category: VendorCategory
  contact_name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  total_cost: number | null
  amount_paid: number | null
  position: number | null
  created_at: string
  updated_at: string
}

export interface Request {
  id: string
  vendor_id: string
  token: string
  request_invoice: boolean
  request_contract: boolean
  request_availability: boolean
  request_package_details: boolean
  request_contact_update: boolean
  personal_note: string | null
  status: RequestStatus
  sent_at: string | null
  viewed_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Response {
  id: string
  request_id: string
  vendor_note: string | null
  created_at: string
}

export interface File {
  id: string
  response_id: string
  file_type: FileType
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

// Extended types for joins
export interface RequestWithVendorAndWedding extends Request {
  vendor: Vendor & {
    wedding: Wedding
  }
}
