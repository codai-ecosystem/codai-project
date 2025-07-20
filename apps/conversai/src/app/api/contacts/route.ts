import { NextRequest, NextResponse } from 'next/server'

export interface Contact {
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
  createdAt: Date
  updatedAt: Date
}

// Mock contacts database
let contacts: Contact[] = [
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
    frequency: 15,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
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
    frequency: 8,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
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
    frequency: 3,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
]

// GET /api/contacts - Fetch contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag')
    const starred = searchParams.get('starred') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let filteredContacts = contacts.filter(contact => {
      const matchesSearch = search === '' || 
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.email.toLowerCase().includes(search.toLowerCase()) ||
        contact.company?.toLowerCase().includes(search.toLowerCase()) ||
        contact.position?.toLowerCase().includes(search.toLowerCase())
      
      const matchesTag = !tag || contact.tags.includes(tag)
      const matchesStarred = !starred || contact.starred

      return matchesSearch && matchesTag && matchesStarred
    })

    // Sort by last contact (most recent first)
    filteredContacts = filteredContacts.sort((a, b) => 
      new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
    )

    // Pagination
    const startIndex = (page - 1) * limit
    const paginatedContacts = filteredContacts.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      data: paginatedContacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredContacts.length / limit),
        totalContacts: filteredContacts.length,
        hasMore: startIndex + limit < filteredContacts.length
      },
      stats: {
        total: contacts.length,
        starred: contacts.filter(c => c.starred).length,
        tags: Array.from(new Set(contacts.flatMap(c => c.tags)))
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, position, address, notes, tags = [] } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingContact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase())
    if (existingContact) {
      return NextResponse.json(
        { success: false, error: 'Contact with this email already exists' },
        { status: 409 }
      )
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      company,
      position,
      address,
      notes,
      starred: false,
      tags: Array.isArray(tags) ? tags : [],
      lastContact: new Date(),
      frequency: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    contacts.push(newContact)

    return NextResponse.json({
      success: true,
      message: 'Contact created successfully',
      data: newContact
    })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts - Update contact
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing contact ID' },
        { status: 400 }
      )
    }

    const contactIndex = contacts.findIndex(contact => contact.id === id)
    if (contactIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Update the contact
    contacts[contactIndex] = { 
      ...contacts[contactIndex], 
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      data: contacts[contactIndex]
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts - Delete contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing contact ID' },
        { status: 400 }
      )
    }

    const contactIndex = contacts.findIndex(contact => contact.id === id)
    if (contactIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      )
    }

    const deletedContact = contacts.splice(contactIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
      data: deletedContact
    })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
