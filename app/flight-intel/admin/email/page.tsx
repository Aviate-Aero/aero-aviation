'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail, Send, Users, X, ChevronDown, ChevronUp,
  ArrowLeft, CheckCircle, AlertCircle, Loader2, Plus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/components/lib/supabase/supbase-client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  full_name: string
  email: string | null
  department: string
  role: string
}

type SendState = 'idle' | 'sending' | 'success' | 'error'

// ─── Employee picker chip ─────────────────────────────────────────────────────

function RecipientChip({ email, onRemove }: { email: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/15 text-sky-300 text-xs rounded-full border border-sky-500/30">
      {email}
      <button type="button" onClick={onRemove} className="hover:text-white transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminEmailPage() {
  const router = useRouter()

  // Recipients
  const [toList, setToList]       = useState<string[]>([])
  const [ccList, setCcList]       = useState<string[]>([])
  const [toInput, setToInput]     = useState('')
  const [ccInput, setCcInput]     = useState('')
  const [showCc, setShowCc]       = useState(false)

  // Compose
  const [subject, setSubject]     = useState('')
  const [body, setBody]           = useState('')

  // Employees
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Preview
  const [preview, setPreview]     = useState(false)

  // Send state
  const [sendState, setSendState] = useState<SendState>('idle')
  const [errorMsg, setErrorMsg]   = useState('')

  // ── Fetch employees ──────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase
      .from('employees')
      .select('full_name, email, department, role')
      .not('email', 'is', null)
      .then(({ data }) => setEmployees((data as Employee[]) || []))
  }, [])

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const addEmail = (list: string[], setter: (v: string[]) => void, raw: string) => {
    const emails = raw.split(/[\s,;]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes('@'))
    const next = [...new Set([...list, ...emails])]
    setter(next)
  }

  const handleToKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ',', ';', ' ', 'Tab'].includes(e.key) && toInput.trim()) {
      e.preventDefault()
      addEmail(toList, setToList, toInput)
      setToInput('')
    }
  }

  const handleCcKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ',', ';', ' ', 'Tab'].includes(e.key) && ccInput.trim()) {
      e.preventDefault()
      addEmail(ccList, setCcList, ccInput)
      setCcInput('')
    }
  }

  const addFromEmployee = (emp: Employee) => {
    if (!emp.email) return
    setToList(prev => [...new Set([...prev, emp.email!])])
    setShowPicker(false)
    setPickerSearch('')
  }

  const filteredEmployees = employees.filter(e =>
    !toList.includes(e.email || '') &&
    (e.full_name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
     (e.email || '').toLowerCase().includes(pickerSearch.toLowerCase()) ||
     e.department.toLowerCase().includes(pickerSearch.toLowerCase()))
  )

  // ── Send ─────────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const finalTo = [...toList]
    if (toInput.trim()) {
      addEmail(finalTo, () => {}, toInput)
      finalTo.push(...toInput.split(/[\s,;]+/).map(e => e.trim()).filter(e => e.includes('@')))
    }

    if (!finalTo.length) { setErrorMsg('Add at least one recipient.'); setSendState('error'); return }
    if (!subject.trim())  { setErrorMsg('Subject cannot be empty.');  setSendState('error'); return }
    if (!body.trim())     { setErrorMsg('Body cannot be empty.');     setSendState('error'); return }

    setSendState('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [...new Set(finalTo)],
          cc: ccList.length ? ccList : undefined,
          subject: subject.trim(),
          body: body.trim(),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unknown error')

      setSendState('success')
      setTimeout(() => {
        setSendState('idle')
        setToList([]); setCcList([]); setToInput(''); setCcInput('')
        setSubject(''); setBody(''); setPreview(false)
      }, 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send email')
      setSendState('error')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative z-20 min-h-screen mt-40">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-6"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/aerodata/admin/welcome')}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-zinc-700">|</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                  <Mail className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-white">Email</h1>
                  <p className="text-sm text-zinc-400">Compose &amp; Send</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreview(p => !p)}
                className="px-4 py-2 text-sm rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSend}
                disabled={sendState === 'sending' || sendState === 'success'}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendState === 'sending' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : sendState === 'success' ? (
                  <><CheckCircle className="w-4 h-4" /> Sent!</>
                ) : (
                  <><Send className="w-4 h-4" /> Send</>
                )}
              </button>
            </div>
          </div>

          {/* Status banners */}
          {sendState === 'success' && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Email sent successfully! The form will reset shortly.
            </div>
          )}
          {sendState === 'error' && errorMsg && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
              <button onClick={() => setSendState('idle')} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Compose card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {/* TO field */}
            <div className="flex items-start gap-3 px-5 py-4 border-b border-zinc-800">
              <span className="text-xs text-zinc-500 pt-1.5 w-8 shrink-0">To</span>
              <div className="flex-1 flex flex-wrap gap-1.5 min-h-[28px]">
                {toList.map(e => (
                  <RecipientChip key={e} email={e} onRemove={() => setToList(toList.filter(x => x !== e))} />
                ))}
                <input
                  type="text"
                  value={toInput}
                  onChange={e => setToInput(e.target.value)}
                  onKeyDown={handleToKeyDown}
                  onBlur={() => { if (toInput.trim()) { addEmail(toList, setToList, toInput); setToInput('') } }}
                  placeholder={toList.length ? '' : 'email@example.com, …'}
                  className="flex-1 min-w-[160px] bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                />
              </div>
              {/* Employee picker button */}
              <div className="relative shrink-0" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setShowPicker(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-sky-400 border border-zinc-700 hover:border-sky-500/50 rounded-lg transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Staff
                  {showPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showPicker && (
                  <div className="absolute right-0 top-full mt-1.5 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50">
                    <div className="p-2.5 border-b border-zinc-800">
                      <input
                        autoFocus
                        type="text"
                        value={pickerSearch}
                        onChange={e => setPickerSearch(e.target.value)}
                        placeholder="Search employees…"
                        className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-1.5 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50"
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredEmployees.length === 0 ? (
                        <p className="text-xs text-zinc-600 text-center py-4">No employees found</p>
                      ) : filteredEmployees.map(emp => (
                        <button
                          key={emp.email}
                          type="button"
                          onClick={() => addFromEmployee(emp)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">
                            {emp.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{emp.full_name}</p>
                            <p className="text-xs text-zinc-500 truncate">{emp.email}</p>
                          </div>
                          <Plus className="w-3.5 h-3.5 text-zinc-600 ml-auto shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CC toggle */}
            <div className="px-5 py-2.5 border-b border-zinc-800 flex items-center gap-3">
              {showCc ? (
                <>
                  <span className="text-xs text-zinc-500 w-8 shrink-0">CC</span>
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {ccList.map(e => (
                      <RecipientChip key={e} email={e} onRemove={() => setCcList(ccList.filter(x => x !== e))} />
                    ))}
                    <input
                      type="text"
                      value={ccInput}
                      onChange={e => setCcInput(e.target.value)}
                      onKeyDown={handleCcKeyDown}
                      onBlur={() => { if (ccInput.trim()) { addEmail(ccList, setCcList, ccInput); setCcInput('') } }}
                      placeholder={ccList.length ? '' : 'cc@example.com'}
                      className="flex-1 min-w-[160px] bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                    />
                  </div>
                  <button onClick={() => { setShowCc(false); setCcList([]); setCcInput('') }} className="text-zinc-600 hover:text-zinc-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCc(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  + Add CC
                </button>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
              <span className="text-xs text-zinc-500 w-14 shrink-0">Subject</span>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject…"
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
              />
            </div>

            {/* Body */}
            {preview ? (
              <div className="p-6">
                {/* Branded preview – unchanged, uses Aero Aviation brand colors */}
                <div className="rounded-xl overflow-hidden border border-zinc-700 max-w-xl mx-auto">
                  <div className="bg-[#08204a] px-8 py-6 text-center">
                    <p className="text-white font-bold text-lg tracking-wide">Aero Aviation</p>
                    <p className="text-[#a0b9e1] text-xs tracking-widest mt-1">An Aviation Company ;</p>
                  </div>
                  <div className="bg-[#1a56af] h-0.5" />
                  <div className="bg-white px-8 py-6">
                    {subject && <p className="text-xs text-zinc-400 mb-4 pb-4 border-b border-zinc-200">{subject}</p>}
                    <p className="text-zinc-800 text-sm leading-relaxed whitespace-pre-wrap">{body || 'Your message will appear here…'}</p>
                  </div>
                  <div className="bg-zinc-50 px-8 py-4 text-center space-y-1">
                    <p className="text-zinc-400 text-xs">Aero Aviation</p>
                    <p className="text-zinc-400 text-xs">Office 5170m, 3 Fitzroy Place, 1/1, Sauchiehall Street, Finnieston Glasgow Central, G3 7RH, United Kingdom</p>
                    <p className="text-zinc-400 text-xs">info@aeroaviation.me</p>
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your message here…"
                rows={14}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-600 px-5 py-5 outline-none resize-none leading-relaxed"
              />
            )}
          </div>

          {/* Recipient summary */}
          {(toList.length > 0 || ccList.length > 0) && (
            <p className="text-xs text-zinc-500 px-1">
              Sending to <span className="text-zinc-300">{toList.length}</span> recipient{toList.length !== 1 ? 's' : ''}
              {ccList.length > 0 && <>, CC <span className="text-zinc-300">{ccList.length}</span></>}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}