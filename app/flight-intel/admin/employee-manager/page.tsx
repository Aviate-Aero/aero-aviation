"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { createSupabaseClient } from "@/components/lib/supabase/supbase-client"
import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Starfield } from "@/components/ui/starfield/Standard"
import {
  Users,
  UserPlus,
  Trash2,
  LogOut,
  Search,
  Camera,
  ChevronDown,
  ChevronUp,
  Building2,
  BadgeCheck,
  Clock,
  Phone,
  Mail,
  Calendar,
  UserX,
  Pencil,
  X,
  Save,
  Download,
} from "lucide-react"
import {
  downloadEmployeePDF,
  downloadEmployeeIDCardFront,
  downloadEmployeeIDCardBack,
} from "@/components/lib/pdf-export/employeePdf/employee-pdf-export"

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeStatus = "active" | "inactive" | "on-leave"
type SalaryCurrency = "PKR" | "USD" | "QAR"

interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string | null
  phone: string | null
  department: string
  role: string
  joining_date: string | null
  status: EmployeeStatus
  salary: number | null
  salary_currency: SalaryCurrency | null
  photo_url: string | null
  photo_path: string | null
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Operations",
  "Engineering",
  "Dispatch",
  "ATC",
  "Cabin Crew",
  "Ground Crew",
  "Finance",
  "HR",
  "IT",
  "Management",
  "Other",
]

const STATUS_STYLES: Record<EmployeeStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  inactive: "bg-red-500/20 text-red-400 border border-red-500/30",
  "on-leave": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
}

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  "on-leave": "On Leave",
}

const CURRENCIES: SalaryCurrency[] = ["PKR", "USD", "QAR"]

const CURRENCY_SYMBOLS: Record<SalaryCurrency, string> = {
  PKR: "₨",
  USD: "$",
  QAR: "QR",
}

const EMPTY_FORM = {
  employee_id: "",
  full_name: "",
  email: "",
  phone: "",
  department: DEPARTMENTS[0],
  role: "",
  joining_date: "",
  status: "active" as EmployeeStatus,
  salary: "",
  salary_currency: "PKR" as SalaryCurrency,
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeeManagerPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  // add form
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // edit modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // list filters
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    setLoading(true)
    try {
      const sb = createSupabaseClient()
      const { data, error } = await sb
        .from("employees")
        .select("*")
        .order("department")
        .order("full_name")
      if (error) throw error
      setEmployees(data ?? [])
    } catch (e) {
      console.error("fetchEmployees:", e)
    } finally {
      setLoading(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be under 5 MB")
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.employee_id.trim() || !form.full_name.trim() || !form.role.trim()) return
    setSubmitting(true)
    setFormError(null)
    try {
      const sb = createSupabaseClient()
      let photo_url: string | null = null
      let photo_path: string | null = null
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg"
        photo_path = `${form.employee_id.trim()}/${Date.now()}.${ext}`
        const { error: upErr } = await sb.storage
          .from("employee-photos")
          .upload(photo_path, photoFile, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = sb.storage.from("employee-photos").getPublicUrl(photo_path)
        photo_url = urlData.publicUrl
      }
      const { data, error } = await sb
        .from("employees")
        .insert([
          {
            employee_id: form.employee_id.trim(),
            full_name: form.full_name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            department: form.department,
            role: form.role.trim(),
            joining_date: form.joining_date || null,
            status: form.status,
            salary: form.salary ? parseFloat(form.salary) : null,
            salary_currency: form.salary ? form.salary_currency : null,
            photo_url,
            photo_path,
          },
        ])
        .select()
      if (error) throw error
      if (data) setEmployees((prev) => [...prev, ...data])
      setForm(EMPTY_FORM)
      setPhotoFile(null)
      setPhotoPreview(null)
      setShowForm(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to add employee")
    } finally {
      setSubmitting(false)
    }
  }

  function handleUpdate(updated: Employee) {
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    setEditingEmployee(null)
  }

  async function handleDelete(emp: Employee) {
    try {
      const sb = createSupabaseClient()
      if (emp.photo_path) await sb.storage.from("employee-photos").remove([emp.photo_path])
      const { error } = await sb.from("employees").delete().eq("id", emp.id)
      if (error) throw error
      setEmployees((prev) => prev.filter((e) => e.id !== emp.id))
      setDeleteConfirm(null)
    } catch (e) {
      console.error("handleDelete:", e)
    }
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      emp.full_name.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q)
    const matchDept = deptFilter === "All" || emp.department === deptFilter
    const matchStatus = statusFilter === "All" || emp.status === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  const byDept = filtered.reduce<Record<string, Employee[]>>((acc, emp) => {
    ;(acc[emp.department] ??= []).push(emp)
    return acc
  }, {})

  const uniqueDepts = [...new Set(employees.map((e) => e.department))].sort()
  const activeCount = employees.filter((e) => e.status === "active").length
  const onLeaveCount = employees.filter((e) => e.status === "on-leave").length

  if (loading) {
    return (
      <main className="relative bg-black text-white overflow-hidden min-h-screen mt-40">
        <div className="relative z-20 flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">
      <Starfield />

      {/* Edit Modal */}
      {editingEmployee && (
        <EditModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleUpdate}
        />
      )}

      <section className="relative z-20 pt-8 pb-24 mt-40">
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
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-zinc-100">Employee Management</h1>
                <p className="text-sm text-zinc-500">Manage staff records, departments, and profiles</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/aerodata/admin/welcome")}
                variant="outline"
                className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50 text-sm rounded-full"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  sessionStorage.removeItem("admin_authenticated")
                  router.push("/aerodata/admin/login")
                }}
                variant="outline"
                className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-sm rounded-full"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <StatCard label="Total Staff" value={employees.length} icon={<Users className="h-5 w-5 text-sky-400" />} />
            <StatCard label="Active" value={activeCount} icon={<BadgeCheck className="h-5 w-5 text-emerald-400" />} />
            <StatCard label="On Leave" value={onLeaveCount} icon={<Clock className="h-5 w-5 text-amber-400" />} />
            <StatCard
              label="Departments"
              value={uniqueDepts.length}
              icon={<Building2 className="h-5 w-5 text-purple-400" />}
            />
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-zinc-100 font-light text-xl">Employee Records</CardTitle>
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-all duration-300 hover:scale-[1.02]"
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Add Employee
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Add Form */}
                {showForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="mb-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-6"
                  >
                    <h3 className="text-base font-light text-zinc-100 mb-5">New Employee</h3>
                    <div className="mb-5 flex items-center gap-4">
                      <div
                        className="relative w-20 h-20 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-sky-500 transition-colors bg-black/40 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {photoPreview ? (
                          <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-sky-400 hover:text-sky-300 font-medium"
                        >
                          Upload Photo
                        </button>
                        <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG, WEBP — max 5 MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField label="Employee ID *">
                        <Input
                          value={form.employee_id}
                          onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                          placeholder="EMP001"
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                        />
                      </FormField>
                      <FormField label="Full Name *">
                        <Input
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="John Doe"
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                        />
                      </FormField>
                      <FormField label="Role / Job Title *">
                        <Input
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          placeholder="Senior Dispatcher"
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                        />
                      </FormField>
                      <FormField label="Department *">
                        <select
                          value={form.department}
                          onChange={(e) => setForm({ ...form, department: e.target.value })}
                          className="w-full rounded-md border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Status *">
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
                          className="w-full rounded-md border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on-leave">On Leave</option>
                        </select>
                      </FormField>
                      <FormField label="Joining Date">
                        <Input
                          type="date"
                          value={form.joining_date}
                          onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                        />
                      </FormField>
                      <FormField label="Email">
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="john@example.com"
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                        />
                      </FormField>
                      <FormField label="Phone">
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                        />
                      </FormField>
                      <FormField label="Salary">
                        <div className="flex gap-2">
                          <select
                            value={form.salary_currency}
                            onChange={(e) => setForm({ ...form, salary_currency: e.target.value as SalaryCurrency })}
                            className="w-24 shrink-0 rounded-md border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            {CURRENCIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <Input
                            value={form.salary}
                            onChange={(e) => setForm({ ...form, salary: e.target.value })}
                            type="number"
                            min="0"
                            placeholder="e.g. 85000"
                            className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                          />
                        </div>
                      </FormField>
                    </div>
                    {formError && (
                      <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                        {formError}
                      </p>
                    )}
                    <div className="mt-5 flex gap-3">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-all duration-300"
                      >
                        {submitting ? "Saving…" : "Add Employee"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false)
                          setFormError(null)
                          setPhotoPreview(null)
                          setPhotoFile(null)
                        }}
                        className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800 rounded-full transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, ID, or role…"
                      className="w-full border border-zinc-700 bg-black/40 text-white rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-zinc-500"
                    />
                  </div>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full sm:w-auto rounded-full border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="All">All Departments</option>
                    {uniqueDepts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto rounded-full border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>

                {/* Employee list */}
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <UserX className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No employees found</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.keys(byDept)
                      .sort()
                      .map((dept) => (
                        <DepartmentSection
                          key={dept}
                          department={dept}
                          employees={byDept[dept]}
                          deleteConfirm={deleteConfirm}
                          onDeleteRequest={setDeleteConfirm}
                          onDeleteConfirm={handleDelete}
                          onDeleteCancel={() => setDeleteConfirm(null)}
                          onEdit={setEditingEmployee}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  employee,
  onClose,
  onSave,
}: {
  employee: Employee
  onClose: () => void
  onSave: (updated: Employee) => void
}) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    employee_id: employee.employee_id,
    full_name: employee.full_name,
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    department: employee.department,
    role: employee.role,
    joining_date: employee.joining_date ?? "",
    status: employee.status,
    salary: employee.salary != null ? String(employee.salary) : "",
    salary_currency: (employee.salary_currency ?? "PKR") as SalaryCurrency,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee.photo_url)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB")
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.role.trim()) return
    setSaving(true)
    setError(null)
    try {
      const sb = createSupabaseClient()
      let photo_url = employee.photo_url
      let photo_path = employee.photo_path

      if (photoFile) {
        // remove old photo if exists
        if (photo_path) await sb.storage.from("employee-photos").remove([photo_path])
        const ext = photoFile.name.split(".").pop() ?? "jpg"
        photo_path = `${form.employee_id}/${Date.now()}.${ext}`
        const { error: upErr } = await sb.storage
          .from("employee-photos")
          .upload(photo_path, photoFile, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = sb.storage.from("employee-photos").getPublicUrl(photo_path)
        photo_url = urlData.publicUrl
      }

      const updates = {
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        department: form.department,
        role: form.role.trim(),
        joining_date: form.joining_date || null,
        status: form.status,
        salary: form.salary ? parseFloat(form.salary) : null,
        salary_currency: form.salary ? form.salary_currency : null,
        photo_url,
        photo_path,
      }

      const { data, error: dbErr } = await sb
        .from("employees")
        .update(updates)
        .eq("id", employee.id)
        .select()
        .single()
      if (dbErr) throw dbErr
      onSave(data as Employee)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onBackdrop}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10">
              <Pencil className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="font-light text-white text-base">Edit Employee</h2>
              <p className="text-xs text-zinc-500 font-mono">{employee.employee_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadEmployeePDF(employee)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 border border-zinc-700 hover:border-emerald-500/40"
            >
              <Download className="w-3.5 h-3.5" />
              Profile PDF
            </button>
            <button
              type="button"
              onClick={() => downloadEmployeeIDCardFront(employee)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-sky-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-500/10 border border-zinc-700 hover:border-sky-500/40"
            >
              <Download className="w-3.5 h-3.5" />
              ID Front
            </button>
            <button
              type="button"
              onClick={() => downloadEmployeeIDCardBack(employee)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-500/10 border border-zinc-700 hover:border-purple-500/40"
            >
              <Download className="w-3.5 h-3.5" />
              ID Back
            </button>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Photo */}
          <div className="flex items-center gap-5">
            <div
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-sky-500 transition-colors bg-black/40 shrink-0"
              onClick={() => photoInputRef.current?.click()}
            >
              {photoPreview ? (
                <Image src={photoPreview} alt="Photo" fill className="object-cover" unoptimized />
              ) : (
                <span className="text-2xl font-light text-sky-400 select-none">
                  {employee.full_name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-sm text-sky-400 hover:text-sky-300 font-medium"
              >
                Change Photo
              </button>
              <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG, WEBP — max 5 MB</p>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name *">
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe"
                required
                className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
              />
            </FormField>
            <FormField label="Employee ID">
              <Input
                value={form.employee_id}
                disabled
                className="border-zinc-700 bg-black/20 text-zinc-500 cursor-not-allowed"
              />
            </FormField>
            <FormField label="Role / Job Title *">
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Senior Dispatcher"
                required
                className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
              />
            </FormField>
            <FormField label="Department *">
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status *">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
                className="w-full rounded-md border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </FormField>
            <FormField label="Joining Date">
              <Input
                type="date"
                value={form.joining_date}
                onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
              />
            </FormField>
            <FormField label="Salary">
              <div className="flex gap-2">
                <select
                  value={form.salary_currency}
                  onChange={(e) => setForm({ ...form, salary_currency: e.target.value as SalaryCurrency })}
                  className="w-24 shrink-0 rounded-md border border-zinc-700 bg-black/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  type="number"
                  min="0"
                  placeholder="e.g. 85000"
                  className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/50"
                />
              </div>
            </FormField>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <Button
              type="submit"
              disabled={saving}
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-all duration-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800 rounded-full transition-all duration-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-zinc-400">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-light text-white">{value}</div>
      </CardContent>
    </Card>
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

function DepartmentSection({
  department,
  employees,
  deleteConfirm,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  onEdit,
}: {
  department: string
  employees: Employee[]
  deleteConfirm: string | null
  onDeleteRequest: (id: string) => void
  onDeleteConfirm: (emp: Employee) => void
  onDeleteCancel: () => void
  onEdit: (emp: Employee) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 mb-3 group text-left"
      >
        <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
        <span className="font-light text-white">{department}</span>
        <span className="text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full px-2 py-0.5">
          {employees.length}
        </span>
        <span className="flex-1" />
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              deleteConfirm={deleteConfirm}
              onDeleteRequest={onDeleteRequest}
              onDeleteConfirm={onDeleteConfirm}
              onDeleteCancel={onDeleteCancel}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmployeeCard({
  employee: emp,
  deleteConfirm,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  onEdit,
}: {
  employee: Employee
  deleteConfirm: string | null
  onDeleteRequest: (id: string) => void
  onDeleteConfirm: (emp: Employee) => void
  onDeleteCancel: () => void
  onEdit: (emp: Employee) => void
}) {
  const isConfirming = deleteConfirm === emp.id

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onEdit(emp)}
        className="flex items-start gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors w-full"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-sky-500/10 border border-sky-500/20 shrink-0 flex items-center justify-center">
          {emp.photo_url ? (
            <Image src={emp.photo_url} alt={emp.full_name} fill className="object-cover" unoptimized={false} />
          ) : (
            <span className="text-lg font-light text-sky-400 select-none">
              {emp.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 flex-wrap">
            <div className="min-w-0">
              <p className="font-light text-white leading-tight truncate">{emp.full_name}</p>
              <p className="text-xs text-zinc-400 truncate">{emp.role}</p>
            </div>
            <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 font-medium ${STATUS_STYLES[emp.status]}`}>
              {STATUS_LABELS[emp.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 font-mono">{emp.employee_id}</p>
        </div>
      </button>

      <div className="px-4 pb-3 space-y-1.5 flex-1">
        {emp.email && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Mail className="w-3 h-3 shrink-0 text-zinc-600" />
            <span className="truncate">{emp.email}</span>
          </div>
        )}
        {emp.phone && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Phone className="w-3 h-3 shrink-0 text-zinc-600" />
            <span>{emp.phone}</span>
          </div>
        )}
        {emp.joining_date && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-3 h-3 shrink-0 text-zinc-600" />
            <span>
              Joined{" "}
              {new Date(emp.joining_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {emp.salary != null && emp.salary_currency && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span>{CURRENCY_SYMBOLS[emp.salary_currency]}</span>
            <span>
              {emp.salary.toLocaleString()} {emp.salary_currency}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(emp)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-sky-400 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => downloadEmployeePDF(emp)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            <Download className="w-3 h-3" /> PDF
          </button>
          <button
            onClick={() => downloadEmployeeIDCardFront(emp)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-sky-400 transition-colors"
          >
            <Download className="w-3 h-3" /> ID Front
          </button>
          <button
            onClick={() => downloadEmployeeIDCardBack(emp)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-purple-400 transition-colors"
          >
            <Download className="w-3 h-3" /> ID Back
          </button>
        </div>

        {isConfirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Remove?</span>
            <button
              onClick={() => onDeleteConfirm(emp)}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={onDeleteCancel}
              className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => onDeleteRequest(emp.id)}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    </div>
  )
}