"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import { createSupabaseClient } from "@/components/lib/supabase/supbase-client"
import type { UserCredential } from "@/components/lib/constants"

import { Users, UserPlus, Trash2, LogOut, Mail, ChevronDown, ChevronUp, Shield } from "lucide-react"

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserCredential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", password: "", email: "" })
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data, error } = await supabase.from("users").select("*")
        if (error) {
          console.error("Error fetching users:", error)
          setUsers([])
          return
        }
        setUsers(data || [])
      } catch (error) {
        console.error("Error creating Supabase client:", error)
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.username.trim() || !newUser.password.trim()) return
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            username: newUser.username.trim(),
            password: newUser.password.trim(),
            email: newUser.email.trim() || null,
          },
        ])
        .select()
      if (error) {
        console.error("Error adding user:", error)
        return
      }
      if (data && data.length > 0) {
        setUsers((prev) => [...prev, ...data])
      }
      setNewUser({ username: "", password: "", email: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Error creating Supabase client:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from("users").delete().eq("id", userId)
      if (error) {
        console.error("Error deleting user:", error)
        return
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Error creating Supabase client:", error)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated")
    router.push("/flight-intel/admin/login")
  }

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  if (isLoading) {
    return (
      <main className="relative bg-black text-white overflow-hidden min-h-screen">
        <div className="relative z-20 flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="relative bg-black text-white overflow-hidden mt-40">
      <section className="relative z-20 pt-8 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-zinc-100">Admin Dashboard</h1>
                <p className="text-sm text-zinc-500">Manage user accounts and system access</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/flight-intel/admin")}
                variant="outline"
                className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50 text-sm rounded-full"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-sm rounded-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2"
          >
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                <Users className="h-5 w-5 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light text-white">{users.length}</div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">With Email</CardTitle>
                <Mail className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light text-white">{users.filter((u) => u.email).length}</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Management Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-zinc-100 font-light text-xl mb-1">User Management</CardTitle>
                    <CardDescription className="text-zinc-500">Add, view, and remove user accounts</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Add User Form */}
                {showAddForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleAddUser}
                    className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6"
                  >
                    <h3 className="text-base font-light text-zinc-100 mb-5">Add New User</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      <FormField label="Username *">
                        <Input
                          type="text"
                          placeholder="john.doe"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/50 rounded-full"
                        />
                      </FormField>
                      <FormField label="Password *">
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/50 rounded-full"
                        />
                      </FormField>
                      <FormField label="Email (Optional)">
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500/50 rounded-full"
                        />
                      </FormField>
                    </div>
                    <div className="mt-5 flex gap-3">
                      <Button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300"
                      >
                        Create User
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800 rounded-full transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="pb-3 text-left text-sm font-medium text-zinc-500">Username</th>
                        <th className="pb-3 text-left text-sm font-medium text-zinc-500">Password</th>
                        <th className="pb-3 text-left text-sm font-medium text-zinc-500">Email</th>
                        <th className="pb-3 text-right text-sm font-medium text-zinc-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-zinc-800/50">
                          <td className="py-4 text-zinc-200 font-mono">{user.username}</td>
                          <td className="py-4 text-zinc-200 font-mono">{user.password}</td>
                          <td className="py-4 text-zinc-400">{user.email || "—"}</td>
                          <td className="py-4 text-right">
                            <Button
                              onClick={() => handleDeleteUser(user.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List */}
                <div className="md:hidden space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="rounded-xl border border-zinc-800/50 bg-black/40 p-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleUserExpansion(user.id)}
                      >
                        <div className="flex-1">
                          <h3 className="font-light text-white font-mono">{user.username}</h3>
                          <p className="text-sm text-zinc-400">{user.email || "No email"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteUser(user.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {expandedUser === user.id ? (
                            <ChevronUp className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                      </div>
                      {expandedUser === user.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Password:</span>
                            <span className="text-zinc-200 font-mono">{user.password}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Email:</span>
                            <span className="text-zinc-200">{user.email || "—"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-zinc-300 text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}