// lib/aircraftService.ts
import { createSupabaseClient } from "../supabase/supbase-client"
import type { AircraftData } from "@/components/types/flightData/aircraft"

export interface AircraftRecord {
  id: string
  key: string
  name: string
  seats: number
  cargo: number
  tora: number
  toda: number
  ref_tow: number
  mtow: number
  created_at?: string
  updated_at?: string
}

export class AircraftService {
  private supabase = createSupabaseClient()

  // Get all aircraft
  async getAircraft(): Promise<AircraftData[]> {
    try {
      console.log('Fetching aircraft from Supabase...')
      const { data, error, status } = await this.supabase
        .from('aircraft')
        .select('*')
        .order('name')

      console.log('Supabase response status:', status)
      
      if (error) {
        console.error('Supabase error fetching aircraft:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Aircraft data fetched:', data?.length || 0, 'records')
      
      // Convert to AircraftData format
      return (data || []).map(record => ({
        key: record.key,
        name: record.name,
        seats: record.seats,
        cargo: record.cargo,
        tora: record.tora,
        toda: record.toda,
        refTow: record.ref_tow,
        mtow: record.mtow
      }))
    } catch (error) {
      console.error('Error in getAircraft:', error)
      return []
    }
  }

  // Add new aircraft
  async addAircraft(aircraft: Omit<AircraftData, 'key'> & { key?: string }) {
    try {
      const key = aircraft.key || this.generateAircraftKey(aircraft.name)

      console.log('Adding aircraft to Supabase:', { ...aircraft, key })

      const { data, error, status } = await this.supabase
        .from('aircraft')
        .insert({
          key,
          name: aircraft.name,
          seats: aircraft.seats,
          cargo: aircraft.cargo,
          tora: aircraft.tora,
          toda: aircraft.toda,
          ref_tow: aircraft.refTow,
          mtow: aircraft.mtow
        })
        .select()

      console.log('Supabase insert result:', { status, data, error })

      if (error) {
        console.error('Supabase insert error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        return { success: false, error: error.message || 'Unknown Supabase error' }
      }

      if (!data?.length) {
        console.error('No data returned from Supabase insert. Possible RLS or permission issue.')
        return { success: false, error: 'No data returned (check RLS or insert permissions)' }
      }

      console.log('Aircraft inserted successfully:', data)
      return { success: true }
    } catch (error: unknown) {
      console.error('Unexpected error in addAircraft:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred'
      return { success: false, error: errorMessage }
    }
  }

  // Update aircraft
  async updateAircraft(key: string, aircraft: Partial<AircraftData>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: Record<string, unknown> = {}
      if (aircraft.name !== undefined) updateData.name = aircraft.name
      if (aircraft.seats !== undefined) updateData.seats = aircraft.seats
      if (aircraft.cargo !== undefined) updateData.cargo = aircraft.cargo
      if (aircraft.tora !== undefined) updateData.tora = aircraft.tora
      if (aircraft.toda !== undefined) updateData.toda = aircraft.toda
      if (aircraft.refTow !== undefined) updateData.ref_tow = aircraft.refTow
      if (aircraft.mtow !== undefined) updateData.mtow = aircraft.mtow

      console.log('Updating aircraft:', key, updateData)

      const { error, status } = await this.supabase
        .from('aircraft')
        .update(updateData)
        .eq('key', key)

      console.log('Supabase update response status:', status)

      if (error) {
        console.error('Supabase error updating aircraft:', error)
        return { 
          success: false, 
          error: this.getErrorMessage(error)
        }
      }

      return { success: true }
    } catch (error: unknown) {
      console.error('Unexpected error in updateAircraft:', error)
      return { 
        success: false, 
        error: this.getErrorMessage(error)
      }
    }
  }

  // Delete aircraft
  async deleteAircraft(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Deleting aircraft:', key)

      const { error, status } = await this.supabase
        .from('aircraft')
        .delete()
        .eq('key', key)

      console.log('Supabase delete response status:', status)

      if (error) {
        console.error('Supabase error deleting aircraft:', error)
        return { 
          success: false, 
          error: this.getErrorMessage(error)
        }
      }

      return { success: true }
    } catch (error: unknown) {
      console.error('Unexpected error in deleteAircraft:', error)
      return { 
        success: false, 
        error: this.getErrorMessage(error)
      }
    }
  }

  // Helper to generate aircraft key from name
  private generateAircraftKey(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Helper to get meaningful error messages
  private getErrorMessage(error: unknown): string {
    if (!error) return 'Unknown error occurred'
    
    if (error instanceof Error) return error.message
    
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      if (typeof errorObj.message === 'string') return errorObj.message
      if (typeof errorObj.details === 'string') return errorObj.details
      if (typeof errorObj.code === 'string') return `Error code: ${errorObj.code}`
    }
    
    if (typeof error === 'string') return error
    
    return 'Unknown error occurred'
  }
}

export const aircraftService = new AircraftService()