/**
 * ConversAI AI Chat Endpoint - Migrated to Centralized RomAI
 */

import { NextRequest } from "next/server";
import { createConversAIRomAIProvider } from '@codai/api-utils/romai';
import { getCBDClient, createDevice, createConversation, createMessage } from '@codai/api-utils/cbd';
import { getServerSession } from "next-auth/next";

interface ConversAIRequest {
    type: 'compose' | 'reply' | 'summary' | 'suggestions' | 'chat'
    context?: {
        originalEmail?: string
        subject?: string
        recipient?: string
        tone?: 'professional' | 'casual' | 'formal'
        purpose?: string
    }
}

interface ConversAIResponse {
    success: boolean
    data?: {
        suggestions?: string[]
        composition?: string
        summary?: string
        smartReply?: string[]
        chatResponse?: string
    }
    error?: string
}

// ConversAI-specific response generation (preserved for reference, now handled by RomAI)
const generateConversAIResponse = (request: ConversAIRequest): ConversAIResponse => {
    const { type, context } = request;

    switch (type) {
        case 'compose':
            return {
                success: true,
                data: {
                    suggestions: [
                        "I hope this email finds you well.",
                        "Thank you for reaching out regarding this matter.",
                        "I appreciate your time and consideration.",
                        "Please let me know if you have any questions.",
                        "Looking forward to hearing from you soon."
                    ],
                    composition: `Dear ${context?.recipient || '[Recipient]'},

I hope this message finds you well. I wanted to reach out regarding ${context?.subject || '[subject]'}.

${context?.purpose ? context.purpose : '[Your message here]'}

Please let me know if you have any questions or if there's anything else I can help clarify.

Best regards,
[Your name]`
                }
            };

        case 'reply':
            return {
                success: true,
                data: {
                    smartReply: [
                        "Thank you for your email. I'll review this and get back to you shortly.",
                        "I appreciate the update. This looks great - well done!",
                        "Thanks for bringing this to my attention. I'll address it right away.",
                        "Could you provide more details about the timeline for this?",
                        "This sounds like an excellent opportunity. Let's schedule a call to discuss."
                    ],
                    suggestions: [
                        "Acknowledge receipt and express appreciation",
                        "Provide a clear timeline for your response",
                        "Ask clarifying questions if needed",
                        "Suggest next steps or follow-up actions",
                        "End with a professional closing"
                    ]
                }
            };

        case 'summary':
            if (!context?.originalEmail) {
                return {
                    success: false,
                    error: 'Original email content required for summary'
                };
            }

            return {
                success: true,
                data: {
                    summary: generateEmailSummary(context.originalEmail)
                }
            };

        case 'suggestions':
            return {
                success: true,
                data: {
                    suggestions: getContextualSuggestions(context)
                }
            };

        case 'chat':
            return {
                success: true,
                data: {
                    chatResponse: "How can I assist you with your email communication today?"
                }
            };

        default:
            return {
                success: false,
                error: 'Invalid AI request type'
            };
    }
};

const generateEmailSummary = (emailContent: string): string => {
    // Simple keyword-based summarization (in production, use actual AI)
    const lines = emailContent.split('\n').filter(line => line.trim().length > 0);
    const importantLines = lines.filter(line =>
        line.includes('important') ||
        line.includes('urgent') ||
        line.includes('deadline') ||
        line.includes('meeting') ||
        line.includes('action') ||
        line.includes('question') ||
        line.includes('request') ||
        line.includes('•') ||
        line.includes('✓')
    );

    if (importantLines.length === 0) {
        return "This email contains general information and communication.";
    }

    return `Key points from this email:\n${importantLines.slice(0, 3).map(line => `• ${line.trim()}`).join('\n')}`;
};

const getContextualSuggestions = (context?: any): string[] => {
    const baseSuggestions = [
        "Schedule a follow-up meeting",
        "Request additional information",
        "Confirm understanding of requirements",
        "Provide status update",
        "Thank for the information shared"
    ];

    if (!context) return baseSuggestions;

    const contextualSuggestions = [];

    if (context.subject?.toLowerCase().includes('meeting')) {
        contextualSuggestions.push(
            "Confirm your availability for the meeting",
            "Suggest alternative meeting times",
            "Request meeting agenda in advance"
        );
    }

    if (context.subject?.toLowerCase().includes('project')) {
        contextualSuggestions.push(
            "Provide project status update",
            "Request project timeline clarification",
            "Offer to schedule project review meeting"
        );
    }

    if (context.subject?.toLowerCase().includes('report')) {
        contextualSuggestions.push(
            "Acknowledge receipt of the report",
            "Request clarification on specific metrics",
            "Schedule presentation of findings"
        );
    }

    return [...contextualSuggestions, ...baseSuggestions].slice(0, 5);
};

// Enhanced POST handler for ConversAI
export async function POST(request: NextRequest) {
    try {
        // Get user session for tracking
        const session = await getServerSession();

        // Initialize CBD database tracking
        const cbdClient = getCBDClient();
        let deviceId: string | null = null;
        let conversationId: string | null = null;

        try {
            // Create device for ConversAI tracking
            deviceId = await createDevice(cbdClient, {
                name: 'ConversAI-Email-Assistant',
                type: 'email_assistant',
                status: 'active',
                lastSeen: new Date(),
                metadata: {
                    platform: 'ConversAI',
                    features: ['email_compose', 'smart_reply', 'summary', 'suggestions']
                },
                capabilities: ['compose', 'reply', 'summary', 'suggestions', 'chat']
            });

            // Create conversation for this request
            conversationId = await createConversation(cbdClient, deviceId, 'ConversAI Email Session', {
                type: 'email_assistance',
                platform: 'ConversAI',
                userId: session?.user?.email || 'anonymous'
            });
        } catch (error) {
            console.warn('CBD tracking setup failed:', error);
        }

        // Parse request body
        const body = await request.json();

        // Log incoming message to CBD
        if (deviceId && conversationId) {
            try {
                await createMessage(cbdClient, {
                    conversationId,
                    deviceId,
                    content: JSON.stringify(body),
                    type: 'command',
                    sender: session?.user?.email || 'anonymous',
                    metadata: { platform: 'ConversAI', direction: 'incoming' },
                    processed: false
                });
            } catch (error) {
                console.warn('CBD message logging failed:', error);
            }
        }

        // Create ConversAI RomAI provider with email-specific context
        const romaiProvider = createConversAIRomAIProvider();

        // Add small delay to simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Process with RomAI
        const response = await romaiProvider.chat({
            messages: [{
                role: 'user',
                content: JSON.stringify(body)
            }],
            model: 'conversai-v1',
            stream: false,
            temperature: 0.7,
            max_tokens: 1000
        });

        // Log response to CBD
        if (deviceId && conversationId) {
            try {
                await createMessage(cbdClient, {
                    conversationId,
                    deviceId,
                    content: response.message.content,
                    type: 'text',
                    sender: 'ConversAI-RomAI',
                    metadata: {
                        platform: 'ConversAI',
                        direction: 'outgoing',
                        romai_used: true,
                        model: response.model,
                        usage: response.usage
                    },
                    processed: true
                });
            } catch (error) {
                console.warn('CBD response logging failed:', error);
            }
        }

        // Parse the RomAI response back to ConversAI format
        let conversaiResponse: ConversAIResponse;
        try {
            // Try to parse the Romanian AGI response as ConversAI format
            const parsedResponse = JSON.parse(response.message.content);
            conversaiResponse = parsedResponse;
        } catch (parseError) {
            // Fallback: treat as a simple chat response
            conversaiResponse = {
                success: true,
                data: {
                    chatResponse: response.message.content
                }
            };
        }

        return Response.json(conversaiResponse);
    } catch (error) {
        console.error('ConversAI endpoint error:', error);
        return Response.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Enhanced GET handler for templates (preserved functionality)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'all';

        // Check if requesting models vs templates  
        if (searchParams.get('type') === 'models') {
            // Use centralized RomAI for models
            const romaiProvider = createConversAIRomAIProvider();
            const models = await romaiProvider.getModels();

            return Response.json({
                models,
                capabilities: [
                    "email-composition",
                    "smart-replies",
                    "email-summarization",
                    "contextual-suggestions",
                    "template-generation",
                    "tone-adjustment",
                    "romanian-cultural-context"
                ],
                limits: {
                    maxTokens: 4000,
                    requestsPerMinute: 100
                },
                service: "ConversAI Email Assistant with Romanian AGI",
                version: "3.0.0-romai",
                romai_integration: true
            });
        }

        // Original templates functionality
        const templates = {
            meeting: [
                {
                    id: 'meeting-request',
                    name: 'Meeting Request',
                    subject: 'Meeting Request - {{topic}}',
                    content: `Hi {{recipient}},

I hope you're doing well. I'd like to schedule a meeting to discuss {{topic}}.

Would you be available for a {{duration}} meeting next week? I'm flexible with timing and can work around your schedule.

Please let me know what works best for you.

Best regards,
{{sender}}`
                },
                {
                    id: 'meeting-confirmation',
                    name: 'Meeting Confirmation',
                    subject: 'Meeting Confirmed - {{date}} at {{time}}',
                    content: `Hi {{recipient}},

This is to confirm our meeting scheduled for {{date}} at {{time}}.

Meeting details:
• Topic: {{topic}}
• Duration: {{duration}}
• Location: {{location}}

Looking forward to our discussion.

Best regards,
{{sender}}`
                }
            ],
            followup: [
                {
                    id: 'gentle-followup',
                    name: 'Gentle Follow-up',
                    subject: 'Following up on {{topic}}',
                    content: `Hi {{recipient}},

I hope you're doing well. I wanted to follow up on {{topic}} that we discussed {{timeframe}}.

{{context}}

Please let me know if you need any additional information from my end.

Best regards,
{{sender}}`
                }
            ],
            business: [
                {
                    id: 'proposal-submission',
                    name: 'Proposal Submission',
                    subject: 'Proposal for {{project}} - {{company}}',
                    content: `Dear {{recipient}},

I hope this email finds you well. Please find attached our proposal for {{project}}.

Key highlights of our proposal:
• {{highlight1}}
• {{highlight2}}
• {{highlight3}}

We're excited about the opportunity to work with {{company}} and look forward to discussing this further.

Best regards,
{{sender}}`
                }
            ]
        };

        const result = category === 'all'
            ? Object.values(templates).flat()
            : templates[category as keyof typeof templates] || [];

        return Response.json({
            success: true,
            data: result,
            categories: Object.keys(templates)
        });
    } catch (error) {
        console.error('ConversAI templates error:', error);
        return Response.json(
            { success: false, error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}
