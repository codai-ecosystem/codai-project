import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
    name: string
    email: string
    company?: string
    subject: string
    message: string
    interesse?: string[]
    timeline?: string
}

// Simple in-memory storage for demo (in production, use a database)
const contactSubmissions: (ContactFormData & {
    id: string
    timestamp: string
    status: 'new' | 'reviewed' | 'responded'
})[] = []

export async function POST(request: NextRequest) {
    try {
        const formData: ContactFormData = await request.json()

        // Validate required fields
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, subject, message' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Create submission record
        const submission = {
            ...formData,
            id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            status: 'new' as const
        }

        // Store submission
        contactSubmissions.push(submission)

        console.log(`[PREZENTAI CONTACT] New submission from ${formData.name} (${formData.email})`)
        console.log(`[PREZENTAI CONTACT] Subject: ${formData.subject}`)
        console.log(`[PREZENTAI CONTACT] Total submissions: ${contactSubmissions.length}`)

        // Simulate sending email notification (in production, integrate with email service)
        // await sendNotificationEmail(formData)

        return NextResponse.json({
            success: true,
            message: 'Thank you for your message! We will get back to you within 24 hours.',
            submissionId: submission.id,
            timestamp: submission.timestamp
        })

    } catch (error) {
        console.error('[PREZENTAI CONTACT] Error processing form submission:', error)

        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // Return contact submission statistics (for admin dashboard)
        const stats = {
            totalSubmissions: contactSubmissions.length,
            newSubmissions: contactSubmissions.filter(s => s.status === 'new').length,
            reviewedSubmissions: contactSubmissions.filter(s => s.status === 'reviewed').length,
            respondedSubmissions: contactSubmissions.filter(s => s.status === 'responded').length,
            recentSubmissions: contactSubmissions
                .slice(-5)
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    email: s.email,
                    subject: s.subject,
                    timestamp: s.timestamp,
                    status: s.status
                }))
        }

        return NextResponse.json(stats)

    } catch (error) {
        console.error('[PREZENTAI CONTACT] Error fetching contact statistics:', error)

        return NextResponse.json(
            { error: 'Failed to fetch contact statistics' },
            { status: 500 }
        )
    }
}
