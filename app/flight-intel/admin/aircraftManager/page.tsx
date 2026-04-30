'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { motion } from 'framer-motion'
import { LogOut, Plus, Edit, Trash2, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

import type { AircraftData } from '@/components/types/flightData/aircraft'
import { aircraftService } from '@/components/lib/flightData/aircraftService'
import { Button } from '@/components/buttons/Standard'

export default function AircraftManager() {
  const [aircraft, setAircraft] = useState<AircraftData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAircraft, setEditingAircraft] = useState<AircraftData | null>(null)
  const [formData, setFormData] = useState<Omit<AircraftData, 'key'>>({
    name: '',
    seats: 0,
    cargo: 0,
    tora: 0,
    toda: 0,
    refTow: 0,
    mtow: 0,
  })
  const [formError, setFormError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    loadAircraft()
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    router.push('/flight-intel/admin/login')
  }

  const loadAircraft = async () => {
    setLoading(true)
    try {
      const data = await aircraftService.getAircraft()
      setAircraft(data)
    } catch (error) {
      console.error('Error loading aircraft:', error)
      setFormError('Failed to load aircraft data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!formData.name.trim()) {
      setFormError('Aircraft name is required')
      return
    }

    if (
      formData.seats <= 0 ||
      formData.cargo < 0 ||
      formData.tora <= 0 ||
      formData.toda <= 0 ||
      formData.refTow <= 0 ||
      formData.mtow <= 0
    ) {
      setFormError('All numeric values must be positive')
      return
    }

    if (formData.toda < formData.tora) {
      setFormError('TODA cannot be less than TORA')
      return
    }

    try {
      if (editingAircraft) {
        const result = await aircraftService.updateAircraft(editingAircraft.key, formData)
        if (result.success) {
          setSuccessMessage(`Aircraft "${formData.name}" updated successfully!`)
          await loadAircraft()
          resetForm()
        } else {
          setFormError(result.error || 'Failed to update aircraft')
        }
      } else {
        const result = await aircraftService.addAircraft(formData)
        if (result.success) {
          setSuccessMessage(`Aircraft "${formData.name}" added successfully!`)
          await loadAircraft()
          resetForm()
        } else {
          setFormError(result.error || 'Failed to add aircraft')
        }
      }
    } catch (error) {
      setFormError('An unexpected error occurred')
      console.error('Error saving aircraft:', error)
    }
  }

  const handleDelete = async (key: string) => {
    const aircraftToDelete = aircraft.find((ac) => ac.key === key)
    if (confirm(`Are you sure you want to delete "${aircraftToDelete?.name}"?`)) {
      try {
        const result = await aircraftService.deleteAircraft(key)
        if (result.success) {
          setSuccessMessage(`Aircraft "${aircraftToDelete?.name}" deleted successfully!`)
          await loadAircraft()
        } else {
          setFormError(result.error || 'Failed to delete aircraft')
        }
      } catch (error) {
        setFormError('An unexpected error occurred while deleting')
        console.error('Error deleting aircraft:', error)
      }
    }
  }

  const handleEdit = (aircraft: AircraftData) => {
    setEditingAircraft(aircraft)
    setFormData({
      name: aircraft.name,
      seats: aircraft.seats,
      cargo: aircraft.cargo,
      tora: aircraft.tora,
      toda: aircraft.toda,
      refTow: aircraft.refTow,
      mtow: aircraft.mtow,
    })
    setShowForm(true)
    setFormError('')
    setSuccessMessage('')
  }

  const handleAddNew = () => {
    setEditingAircraft(null)
    resetForm()
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      seats: 0,
      cargo: 0,
      tora: 0,
      toda: 0,
      refTow: 0,
      mtow: 0,
    })
    setEditingAircraft(null)
    setShowForm(false)
    setFormError('')
    setSuccessMessage('')
  }

  useEffect(() => {
    if (successMessage || formError) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
        setFormError('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, formError])

  if (loading) {
    return (
      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400 mx-auto" />
          <p className="text-zinc-400">Loading aircraft data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-20 min-h-screen mt-40">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-white mb-2">Aircraft Fleet</h1>
              <p className="text-zinc-400">Manage your aircraft inventory and specifications</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/flight-intel/admin')}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleAddNew}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Aircraft
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Add/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium text-white">
                    {editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Aircraft Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., B737-800"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Seat Capacity *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 180"
                          value={formData.seats}
                          onChange={(e) =>
                            setFormData({ ...formData, seats: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Cargo Capacity (kg) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 19000"
                          value={formData.cargo}
                          onChange={(e) =>
                            setFormData({ ...formData, cargo: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          TORA (m) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 2300"
                          value={formData.tora}
                          onChange={(e) =>
                            setFormData({ ...formData, tora: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          TODA (m) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 2600"
                          value={formData.toda}
                          onChange={(e) =>
                            setFormData({ ...formData, toda: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Reference TOW (kg) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 70000"
                          value={formData.refTow}
                          onChange={(e) =>
                            setFormData({ ...formData, refTow: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          MTOW (kg) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 79000"
                          value={formData.mtow}
                          onChange={(e) =>
                            setFormData({ ...formData, mtow: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      {editingAircraft ? 'Update Aircraft' : 'Add Aircraft'}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Empty State */}
          {aircraft.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <AlertCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No aircraft found</h3>
              <p className="text-zinc-400 mb-6">
                Get started by adding your first aircraft to the database.
              </p>
              <Button onClick={handleAddNew} className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Aircraft
              </Button>
            </div>
          ) : (
            /* Aircraft Grid */
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {aircraft.map((ac) => (
                <div
                  key={ac.key}
                  className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-lg text-white">{ac.name}</h3>
                    <span className="bg-sky-500/20 text-sky-300 text-xs px-2 py-1 rounded-full border border-sky-500/30">
                      {ac.key}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                      <span className="text-zinc-400">Seats:</span>
                      <span className="font-medium text-white">{ac.seats}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                      <span className="text-zinc-400">Cargo:</span>
                      <span className="font-medium text-white">{ac.cargo.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                      <span className="text-zinc-400">TORA:</span>
                      <span className="font-medium text-white">{ac.tora.toLocaleString()} m</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                      <span className="text-zinc-400">TODA:</span>
                      <span className="font-medium text-white">{ac.toda.toLocaleString()} m</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                      <span className="text-zinc-400">Ref TOW:</span>
                      <span className="font-medium text-white">{ac.refTow.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400">MTOW:</span>
                      <span className="font-medium text-white">{ac.mtow.toLocaleString()} kg</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-zinc-800">
                    <button
  onClick={() => handleEdit(ac)}
  className="flex-1 bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 hover:text-sky-100 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-sky-500/30 hover:border-sky-500/60"
>
  <Edit className="w-4 h-4" />
  Edit
</button>
                    <button
  onClick={() => handleDelete(ac.key)}
  className="flex-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-rose-100 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-500/60"
>
  <Trash2 className="w-4 h-4" />
  Delete
</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}