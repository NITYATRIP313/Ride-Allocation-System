import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types matching your DB schema
export interface DBUser {
  user_id: number
  name: string
  phone: string
  email: string
  password: string
  user_type: 'rider' | 'driver'
}

export interface DBDriver {
  driver_id: number
  license_number: string
  experience_years: number
  status: 'available' | 'busy' | 'offline'
  rating: number
  user_id: number
}

export interface DBVehicle {
  vehicle_id: number
  vehicle_number: string
  model: string
  vehicle_type: string
  capacity: number
  color: string
  driver_id: number
}

export interface DBLocation {
  location_id: number
  latitude: number
  longitude: number
  address: string
}

export interface DBRideRequest {
  request_id: number
  request_time: string
  status: 'searching' | 'completed' | 'cancelled'
  user_id: number
  pickup_location_id: number
  drop_location_id: number
}

export interface DBRide {
  ride_id: number
  start_time: string
  end_time: string | null
  ride_status: 'completed' | 'cancelled' | 'started' | 'assigned'
  request_id: number
  driver_id: number
}
