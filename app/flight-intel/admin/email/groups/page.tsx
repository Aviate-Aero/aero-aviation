'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  UserPlus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/components/lib/supabase/supbase-client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailContact {
  id: string
  full_name: string
  email: string
  department: string | null
  role: string | null
  source: string
  employee_id: string | null
}

interface EmailGroup {
  id: string
  name: string
  description: string | null
  created_at?: string
}

interface GroupMember {
  id: string
  group_id: string
  contact_id: string
  email_contacts: EmailContact[] | EmailContact | null
}

type StatusType = 'idle' | 'success' | 'error'

// ─── Helper for Supabase joins ────────────────────────────────────────────────

const getJoinedContact = (
  contact: EmailContact[] | EmailContact | null,
): EmailContact | null => {
  if (!contact) return null

  if (Array.isArray(contact)) {
    return contact[0] || null
  }

  return contact
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailGroupsPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [groups, setGroups] = useState<EmailGroup[]>([])
  const [contacts, setContacts] = useState<EmailContact[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')

  const [contactSearch, setContactSearch] = useState('')

  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactDepartment, setNewContactDepartment] = useState('')
  const [newContactRole, setNewContactRole] = useState('')

  const [loading, setLoading] = useState(true)
  const [savingGroup, setSavingGroup] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)

  const [status, setStatus] = useState<StatusType>('idle')
  const [message, setMessage] = useState('')

  const selectedGroup = groups.find(group => group.id === selectedGroupId)

  const selectedMemberContactIds = useMemo(() => {
    return members.map(member => member.contact_id)
  }, [members])

  const filteredContacts = useMemo(() => {
    const search = contactSearch.toLowerCase().trim()

    if (!search) return contacts

    return contacts.filter(contact => {
      return (
        contact.full_name.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        (contact.department || '').toLowerCase().includes(search) ||
        (contact.role || '').toLowerCase().includes(search) ||
        contact.source.toLowerCase().includes(search)
      )
    })
  }, [contacts, contactSearch])

  useEffect(() => {
    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      fetchMembers(selectedGroupId)
    } else {
      setMembers([])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId])

  const showStatus = (type: StatusType, text: string) => {
    setStatus(type)
    setMessage(text)
  }

  const clearStatus = () => {
    setStatus('idle')
    setMessage('')
  }

  const resetContactForm = () => {
    setNewContactName('')
    setNewContactEmail('')
    setNewContactDepartment('')
    setNewContactRole('')
  }

  const closeAddMemberModal = () => {
    setIsAddMemberOpen(false)
    setContactSearch('')
    resetContactForm()
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      clearStatus()

      const [groupsResult, contactsResult] = await Promise.all([
        supabase
          .from('email_groups')
          .select('id, name, description, created_at')
          .order('name'),

        supabase
          .from('email_contacts')
          .select('id, full_name, email, department, role, source, employee_id')
          .order('full_name'),
      ])

      if (groupsResult.error) throw groupsResult.error
      if (contactsResult.error) throw contactsResult.error

      const groupData = (groupsResult.data || []) as EmailGroup[]
      const contactData = (contactsResult.data || []) as EmailContact[]

      setGroups(groupData)
      setContacts(contactData)

      if (groupData.length > 0) {
        setSelectedGroupId(groupData[0].id)
      }
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to load data',
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async (groupId: string) => {
    try {
      clearStatus()

      const { data, error } = await supabase
        .from('email_group_members')
        .select(`
          id,
          group_id,
          contact_id,
          email_contacts (
            id,
            full_name,
            email,
            department,
            role,
            source,
            employee_id
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMembers((data || []) as unknown as GroupMember[])
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to load group members',
      )
    }
  }

  const createGroup = async () => {
    if (!groupName.trim()) {
      showStatus('error', 'Group name is required.')
      return
    }

    try {
      setSavingGroup(true)
      clearStatus()

      const { data, error } = await supabase
        .from('email_groups')
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
        })
        .select('id, name, description, created_at')
        .single()

      if (error) throw error

      const newGroup = data as EmailGroup

      setGroups(prev =>
        [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)),
      )

      setSelectedGroupId(newGroup.id)
      setGroupName('')
      setGroupDescription('')

      showStatus('success', 'Group created successfully.')
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to create group',
      )
    } finally {
      setSavingGroup(false)
    }
  }

  const deleteGroup = async (groupId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this group? Members will also be removed from this group.',
    )

    if (!confirmed) return

    try {
      clearStatus()

      const { error } = await supabase
        .from('email_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      const nextGroups = groups.filter(group => group.id !== groupId)

      setGroups(nextGroups)

      if (selectedGroupId === groupId) {
        setSelectedGroupId(nextGroups[0]?.id || null)
      }

      showStatus('success', 'Group deleted successfully.')
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to delete group',
      )
    }
  }

  const addContactToGroup = async (contactId: string) => {
    if (!selectedGroupId) {
      showStatus('error', 'Please select a group first.')
      return
    }

    const alreadyAdded = selectedMemberContactIds.includes(contactId)

    if (alreadyAdded) {
      showStatus('error', 'This contact is already added to the selected group.')
      return
    }

    try {
      setSavingMemberId(contactId)
      clearStatus()

      const { error } = await supabase
        .from('email_group_members')
        .upsert(
          {
            group_id: selectedGroupId,
            contact_id: contactId,
          },
          {
            onConflict: 'group_id,contact_id',
          },
        )

      if (error) throw error

      await fetchMembers(selectedGroupId)

      showStatus('success', 'Member added successfully.')
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to add member',
      )
    } finally {
      setSavingMemberId(null)
    }
  }

  const createContactAndAddToGroup = async () => {
    if (!selectedGroupId) {
      showStatus('error', 'Please select a group first.')
      return
    }

    if (!newContactName.trim()) {
      showStatus('error', 'Contact name is required.')
      return
    }

    if (!newContactEmail.trim() || !newContactEmail.includes('@')) {
      showStatus('error', 'Valid email is required.')
      return
    }

    try {
      setSavingContact(true)
      clearStatus()

      const cleanEmail = newContactEmail.trim().toLowerCase()

      const { data: existingContact, error: existingError } = await supabase
        .from('email_contacts')
        .select('id, full_name, email, department, role, source, employee_id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (existingError) throw existingError

      let contactToAdd: EmailContact

      if (existingContact) {
        contactToAdd = existingContact as EmailContact
      } else {
        const { data: newContactData, error: createError } = await supabase
          .from('email_contacts')
          .insert({
            full_name: newContactName.trim(),
            email: cleanEmail,
            department: newContactDepartment.trim() || null,
            role: newContactRole.trim() || null,
            source: 'manual',
          })
          .select('id, full_name, email, department, role, source, employee_id')
          .single()

        if (createError) throw createError

        contactToAdd = newContactData as EmailContact

        setContacts(prev =>
          [...prev, contactToAdd].sort((a, b) =>
            a.full_name.localeCompare(b.full_name),
          ),
        )
      }

      const alreadyAdded = selectedMemberContactIds.includes(contactToAdd.id)

      if (!alreadyAdded) {
        const { error: memberError } = await supabase
          .from('email_group_members')
          .upsert(
            {
              group_id: selectedGroupId,
              contact_id: contactToAdd.id,
            },
            {
              onConflict: 'group_id,contact_id',
            },
          )

        if (memberError) throw memberError
      }

      await fetchMembers(selectedGroupId)

      resetContactForm()

      showStatus('success', 'Contact added to selected group.')
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to create and add contact',
      )
    } finally {
      setSavingContact(false)
    }
  }

  const removeMemberFromGroup = async (memberId: string) => {
    if (!selectedGroupId) return

    try {
      clearStatus()

      const { error } = await supabase
        .from('email_group_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(prev => prev.filter(member => member.id !== memberId))

      showStatus('success', 'Member removed successfully.')
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to remove member',
      )
    }
  }

  const deleteContact = async (contactId: string) => {
    const confirmed = window.confirm(
      'Delete this contact completely? It will also be removed from all groups.',
    )

    if (!confirmed) return

    try {
      clearStatus()

      const { error } = await supabase
        .from('email_contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error

      setContacts(prev => prev.filter(contact => contact.id !== contactId))
      setMembers(prev => prev.filter(member => member.contact_id !== contactId))

      showStatus('success', 'Contact deleted successfully.')
    } catch (err) {
      showStatus(
        'error',
        err instanceof Error ? err.message : 'Failed to delete contact',
      )
    }
  }

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
                onClick={() => router.push('/flight-intel/admin/email')}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email
              </button>

              <span className="text-zinc-700">|</span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>

                <div>
                  <h1 className="text-2xl font-light text-white">
                    Email Groups
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Create groups and manage members in one place
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          {status !== 'idle' && message && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                status === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}

              {message}

              <button onClick={clearStatus} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading groups…
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Create group */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <div>
                    <h2 className="text-white text-lg font-medium mt-2 ml-4">
                      Create Group
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1 ml-4">
                      Example: Flight-Intel users, aircraft customers, etc.
                    </p>
                  </div>

                  <div className="mt-5 ml-4 max-w-[220px] space-y-3">
                    <input
                      type="text"
                      value={groupName}
                      onChange={e => setGroupName(e.target.value)}
                      placeholder="Group name"
                      className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-2 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50"
                    />

                    <textarea
                      value={groupDescription}
                      onChange={e => setGroupDescription(e.target.value)}
                      placeholder="Description optional"
                      rows={3}
                      className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-2 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50 resize-none"
                    />

                    <button
                      onClick={createGroup}
                      disabled={savingGroup}
                      className="mb-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-50"
                    >
                      {savingGroup ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Group
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Groups list */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800">
                    <h2 className="text-white text-lg font-medium">
                      Groups
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                      {groups.length} group{groups.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="max-h-[620px] overflow-y-auto">
                    {groups.length === 0 ? (
                      <p className="text-sm text-zinc-600 text-center py-8">
                        No groups created yet.
                      </p>
                    ) : (
                      groups.map(group => (
                        <div
                          key={group.id}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800/70 ${
                            selectedGroupId === group.id
                              ? 'bg-sky-500/10'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <button
                            onClick={() => setSelectedGroupId(group.id)}
                            className="flex-1 text-left min-w-0"
                          >
                            <p className="text-sm text-white font-medium truncate">
                              {group.name}
                            </p>

                            {group.description && (
                              <p className="text-xs text-zinc-500 truncate mt-0.5">
                                {group.description}
                              </p>
                            )}
                          </button>

                          <button
                            onClick={() => deleteGroup(group.id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors"
                            title="Delete group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right column - selected group workspace */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-white text-lg font-medium truncate">
                      {selectedGroup ? selectedGroup.name : 'Select Group'}
                    </h2>

                    <p className="text-zinc-500 text-sm mt-1">
                      {selectedGroup
                        ? `${members.length} member${
                            members.length !== 1 ? 's' : ''
                          }`
                        : 'Choose a group from the left side'}
                    </p>
                  </div>

                  {selectedGroup && (
                    <button
                      onClick={() => setIsAddMemberOpen(true)}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </button>
                  )}
                </div>

                <div className="max-h-[720px] overflow-y-auto">
                  {!selectedGroup ? (
                    <div className="text-center py-16 px-5">
                      <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />

                      <p className="text-sm text-zinc-400">
                        Select or create a group first.
                      </p>

                      <p className="text-xs text-zinc-600 mt-1">
                        After selecting a group, you can add existing contacts or
                        create new members.
                      </p>
                    </div>
                  ) : members.length === 0 ? (
                    <div className="text-center py-16 px-5">
                      <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />

                      <p className="text-sm text-zinc-400">
                        No members in this group yet.
                      </p>

                      <p className="text-xs text-zinc-600 mt-1">
                        Add existing contacts or create a new contact for this
                        group.
                      </p>

                      <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Member
                      </button>
                    </div>
                  ) : (
                    members.map(member => {
                      const contact = getJoinedContact(member.email_contacts)

                      if (!contact) return null

                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/70 hover:bg-white/5"
                        >
                          <div className="w-9 h-9 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">
                            {contact.full_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-white font-medium truncate">
                                {contact.full_name}
                              </p>

                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                                {contact.source}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-500 truncate">
                              {contact.email}
                            </p>

                            {(contact.department || contact.role) && (
                              <p className="text-xs text-zinc-600 truncate mt-0.5">
                                {[contact.department, contact.role]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => removeMemberFromGroup(member.id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors"
                            title="Remove from group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add member modal */}
      {isAddMemberOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-white text-lg font-medium">
                  Add Members
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  Adding to:{' '}
                  <span className="text-sky-400">{selectedGroup.name}</span>
                </p>
              </div>

              <button
                onClick={closeAddMemberModal}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(90vh-73px)] overflow-y-auto">
              {/* Existing contacts */}
              <div className="border-b lg:border-b-0 lg:border-r border-zinc-800">
                <div className="p-5 border-b border-zinc-800">
                  <h3 className="text-white text-sm font-medium">
                    Existing Contacts
                  </h3>

                  <p className="text-zinc-500 text-xs mt-1">
                    Search and add existing contacts to this group.
                  </p>

                  <div className="mt-4 flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-zinc-500" />

                    <input
                      type="text"
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      placeholder="Search by name, email, department..."
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-[480px] overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <p className="text-sm text-zinc-600 text-center py-8">
                      No contacts found.
                    </p>
                  ) : (
                    filteredContacts.map(contact => {
                      const alreadyAdded = selectedMemberContactIds.includes(
                        contact.id,
                      )

                      return (
                        <div
                          key={contact.id}
                          className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/70 hover:bg-white/5"
                        >
                          <div className="w-9 h-9 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">
                            {contact.full_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-white font-medium truncate">
                                {contact.full_name}
                              </p>

                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                                {contact.source}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-500 truncate">
                              {contact.email}
                            </p>

                            {(contact.department || contact.role) && (
                              <p className="text-xs text-zinc-600 truncate mt-0.5">
                                {[contact.department, contact.role]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => addContactToGroup(contact.id)}
                              disabled={
                                savingMemberId === contact.id || alreadyAdded
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${
                                alreadyAdded
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-sky-500 hover:bg-sky-600 text-white'
                              }`}
                            >
                              {savingMemberId === contact.id
                                ? 'Adding...'
                                : alreadyAdded
                                  ? 'Added'
                                  : 'Add'}
                            </button>

                            {contact.source === 'manual' && (
                              <button
                                onClick={() => deleteContact(contact.id)}
                                className="text-zinc-600 hover:text-rose-400 transition-colors"
                                title="Delete contact"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Create new contact */}
              <div className="p-5">
                <div className="mb-5">
                  <h3 className="text-white text-sm font-medium">
                    Create New Member
                  </h3>

                  <p className="text-zinc-500 text-xs mt-1">
                    Create a new contact and add it directly to this group.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-2 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50"
                  />

                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={e => setNewContactEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-2 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50"
                  />

                  <input
                    type="text"
                    value={newContactDepartment}
                    onChange={e => setNewContactDepartment(e.target.value)}
                    placeholder="Department optional"
                    className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-2 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50"
                  />

                  <input
                    type="text"
                    value={newContactRole}
                    onChange={e => setNewContactRole(e.target.value)}
                    placeholder="Role optional"
                    className="w-full bg-zinc-950 text-sm text-white placeholder-zinc-600 px-3 py-2 rounded-lg outline-none border border-zinc-700 focus:border-sky-500/50"
                  />

                  <button
                    onClick={createContactAndAddToGroup}
                    disabled={savingContact || !selectedGroupId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                  >
                    {savingContact ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create & Add to Group
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Tip: If the email already exists, it will not create a
                    duplicate contact. It will simply add the existing contact to
                    the selected group.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}