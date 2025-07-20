'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  Star,
  Filter,
  Import,
  Download,
  Users,
  User,
  X
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  address?: string
  notes?: string
  starred: boolean
  avatar?: string
  tags: string[]
  lastContact: Date
  frequency: number
}

interface ContactManagerProps {
  isOpen: boolean
  onClose: () => void
  onSelectContact?: (contact: Contact) => void
}

export default function ContactManager({ isOpen, onClose, onSelectContact }: ContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Solutions',
      position: 'Senior Business Analyst',
      address: '123 Business Ave, San Francisco, CA',
      notes: 'Key contact for quarterly reports and business metrics',
      starred: true,
      tags: ['Business', 'Reports', 'VIP'],
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      frequency: 15
    },
    {
      id: '2',
      name: 'Sarah Martinez',
      email: 'sarah.martinez@designstudio.com',
      phone: '+1 (555) 987-6543',
      company: 'Design Studio Inc',
      position: 'Creative Director',
      notes: 'Excellent designer, always delivers ahead of schedule',
      starred: false,
      tags: ['Design', 'Projects', 'Creative'],
      lastContact: new Date(Date.now() - 6 * 60 * 60 * 1000),
      frequency: 8
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      email: 'maria@innovationlabs.com',
      phone: '+1 (555) 456-7890',
      company: 'Innovation Labs',
      position: 'Senior Product Manager',
      notes: 'Interested in AI collaboration opportunities',
      starred: false,
      tags: ['AI', 'Product', 'Collaboration'],
      lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000),
      frequency: 3
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showAddContact, setShowAddContact] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    notes: '',
    tags: [] as string[]
  })

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags)))

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = !selectedTag || contact.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: Date.now().toString(),
        ...newContact,
        starred: false,
        lastContact: new Date(),
        frequency: 0
      }
      setContacts(prev => [...prev, contact])
      setNewContact({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        address: '',
        notes: '',
        tags: []
      })
      setShowAddContact(false)
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      position: contact.position || '',
      address: contact.address || '',
      notes: contact.notes || '',
      tags: contact.tags
    })
    setShowAddContact(true)
  }

  const handleUpdateContact = () => {
    if (editingContact && newContact.name && newContact.email) {
      setContacts(prev => prev.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...newContact }
          : c
      ))
      setEditingContact(null)
      setNewContact({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        address: '',
        notes: '',
        tags: []
      })
      setShowAddContact(false)
    }
  }

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const handleStarContact = (id: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, starred: !c.starred } : c
    ))
  }

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatLastContact = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days}d ago`
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Manager</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {contacts.length} contacts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Import">
              <Import className="h-5 w-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Export">
              <Download className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 bg-gray-50">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedTag === null ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                All Contacts ({contacts.length})
              </button>
              <button
                onClick={() => setSelectedTag('starred')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedTag === 'starred' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Starred ({contacts.filter(c => c.starred).length})
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
              <div className="space-y-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedTag === tag ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {tag} ({contacts.filter(c => c.tags.includes(tag)).length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSelectContact?.(contact)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {getAvatarInitials(contact.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500">{contact.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStarContact(contact.id)
                        }}
                        className={`p-1 rounded ${contact.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                      >
                        <Star className={`h-4 w-4 ${contact.starred ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditContact(contact)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteContact(contact.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span className="truncate">{contact.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{contact.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatLastContact(contact.lastContact)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No contacts found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || selectedTag 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first contact to get started'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newContact.company}
                  onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newContact.position}
                  onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddContact(false)
                    setEditingContact(null)
                    setNewContact({
                      name: '',
                      email: '',
                      phone: '',
                      company: '',
                      position: '',
                      address: '',
                      notes: '',
                      tags: []
                    })
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingContact ? handleUpdateContact : handleAddContact}
                  disabled={!newContact.name || !newContact.email}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingContact ? 'Update' : 'Add'} Contact
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
