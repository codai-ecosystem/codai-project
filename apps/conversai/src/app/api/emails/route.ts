import { NextRequest, NextResponse } from 'next/server'

export interface EmailData {
    id: string
    from: string
    to: string
    cc?: string
    bcc?: string
    subject: string
    content: string
    timestamp: Date
    read: boolean
    starred: boolean
    important: boolean
    attachments: number
    labels: string[]
    folder: string
    aiSuggestions?: string[]
}

// Mock email database
let emails: EmailData[] = [
    {
        id: '1',
        from: 'Alex Johnson <alex@techcorp.com>',
        to: 'you@company.com',
        subject: 'Quarterly Report Review - Q4 2024',
        content: `Hi there,

I hope this email finds you well. I've attached the quarterly report for Q4 2024 for your review. 

Key highlights include:
• 23% revenue growth compared to Q3
• Successful launch of 3 new product features
• Customer satisfaction rating increased to 4.8/5
• Team expansion by 15 new hires

Please review the attached document and let me know if you have any questions or need clarification on any of the metrics.

Looking forward to discussing this in our upcoming meeting.

Best regards,
Alex Johnson
Senior Business Analyst
TechCorp Solutions`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        starred: true,
        important: true,
        attachments: 2,
        labels: ['Business', 'Reports'],
        folder: 'inbox',
        aiSuggestions: [
            'Schedule a follow-up meeting',
            'Request detailed metrics breakdown',
            'Acknowledge receipt and praise performance'
        ]
    },
    {
        id: '2',
        from: 'Sarah Martinez <sarah.martinez@designstudio.com>',
        to: 'you@company.com',
        subject: 'Project Timeline Update',
        content: `Hi,

Quick update on the design project timeline.

Good news - we're slightly ahead of schedule and should be able to deliver the final designs by Friday instead of Monday as originally planned.

The team has been working efficiently on:
✓ User interface mockups (completed)
✓ Brand guidelines (completed)  
✓ Asset creation (90% complete)
✓ Final reviews (in progress)

Would you like to schedule a presentation for early next week to review everything together?

Thanks,
Sarah Martinez
Creative Director`,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        starred: false,
        important: false,
        attachments: 0,
        labels: ['Projects', 'Design'],
        folder: 'inbox',
        aiSuggestions: [
            'Confirm early delivery acceptance',
            'Schedule design review meeting',
            'Ask about final deliverables format'
        ]
    }
]

// GET /api/emails - Fetch emails
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const folder = searchParams.get('folder') || 'inbox'
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        let filteredEmails = emails.filter(email => {
            const matchesFolder = folder === 'all' || email.folder === folder
            const matchesSearch = search === '' ||
                email.subject.toLowerCase().includes(search.toLowerCase()) ||
                email.from.toLowerCase().includes(search.toLowerCase()) ||
                email.content.toLowerCase().includes(search.toLowerCase())

            return matchesFolder && matchesSearch
        })

        // Sort by timestamp (newest first)
        filteredEmails = filteredEmails.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        // Pagination
        const startIndex = (page - 1) * limit
        const paginatedEmails = filteredEmails.slice(startIndex, startIndex + limit)

        return NextResponse.json({
            success: true,
            data: paginatedEmails,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(filteredEmails.length / limit),
                totalEmails: filteredEmails.length,
                hasMore: startIndex + limit < filteredEmails.length
            }
        })
    } catch (error) {
        console.error('Error fetching emails:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch emails' },
            { status: 500 }
        )
    }
}

// POST /api/emails - Send new email
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { to, cc, bcc, subject, content, priority, attachments, scheduled } = body

        if (!to || !subject || !content) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: to, subject, content' },
                { status: 400 }
            )
        }

        const newEmail: EmailData = {
            id: Date.now().toString(),
            from: 'you@company.com',
            to,
            cc,
            bcc,
            subject,
            content,
            timestamp: new Date(),
            read: true,
            starred: false,
            important: priority === 'high',
            attachments: attachments?.length || 0,
            labels: [],
            folder: 'sent'
        }

        emails.push(newEmail)

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        return NextResponse.json({
            success: true,
            message: scheduled ? 'Email scheduled successfully' : 'Email sent successfully',
            data: newEmail
        })
    } catch (error) {
        console.error('Error sending email:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to send email' },
            { status: 500 }
        )
    }
}

// PUT /api/emails - Update email (mark as read, star, etc.)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, updates } = body

        if (!id || !updates) {
            return NextResponse.json(
                { success: false, error: 'Missing email ID or updates' },
                { status: 400 }
            )
        }

        const emailIndex = emails.findIndex(email => email.id === id)
        if (emailIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Email not found' },
                { status: 404 }
            )
        }

        // Update the email
        emails[emailIndex] = { ...emails[emailIndex], ...updates }

        return NextResponse.json({
            success: true,
            message: 'Email updated successfully',
            data: emails[emailIndex]
        })
    } catch (error) {
        console.error('Error updating email:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update email' },
            { status: 500 }
        )
    }
}

// DELETE /api/emails - Delete email
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing email ID' },
                { status: 400 }
            )
        }

        const emailIndex = emails.findIndex(email => email.id === id)
        if (emailIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Email not found' },
                { status: 404 }
            )
        }

        const deletedEmail = emails.splice(emailIndex, 1)[0]

        return NextResponse.json({
            success: true,
            message: 'Email deleted successfully',
            data: deletedEmail
        })
    } catch (error) {
        console.error('Error deleting email:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete email' },
            { status: 500 }
        )
    }
}
