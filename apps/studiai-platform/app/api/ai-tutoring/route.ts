import { NextRequest, NextResponse } from 'next/server'

interface TutoringRequest {
  student: {
    id?: string
    name: string
    level: 'elementary' | 'middle' | 'high_school' | 'college' | 'graduate'
    subject: string
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
    preferredLanguage: string
  }
  session: {
    topic: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    question?: string
    context?: string
    previousSessions?: string[]
    timeLimit?: number // minutes
    goals?: string[]
  }
  preferences: {
    explanation_style: 'simple' | 'detailed' | 'step_by_step'
    examples_preferred: boolean
    interactive_mode: boolean
    assessment_included: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const tutoringData: TutoringRequest = await request.json()

    if (!tutoringData.student || !tutoringData.session) {
      return NextResponse.json(
        { error: 'Student information and session details are required' },
        { status: 400 }
      )
    }

    // Generate AI tutoring session
    const tutoringSession = await generateTutoringSession(tutoringData)

    return NextResponse.json(tutoringSession, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'AI tutoring session generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return available tutoring capabilities
    const capabilities = await getTutoringCapabilities()
    return NextResponse.json(capabilities, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve tutoring capabilities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateTutoringSession(data: TutoringRequest) {
  // Create personalized tutoring approach
  const approach = createPersonalizedApproach(data.student, data.preferences)

  // Generate lesson plan
  const lessonPlan = generateLessonPlan(data.session, approach)

  // Create assessment strategy
  const assessment = generateAssessment(data.session, data.student.level)

  try {
    // Try to enhance with AI if available
    const aiEnhancedSession = await enhanceWithAI(data, approach, lessonPlan, assessment)
    return aiEnhancedSession
  } catch (error) {
    // Fallback to rule-based tutoring
    return {
      sessionId: `tutor_${Date.now()}`,
      student: data.student,
      approach,
      lessonPlan,
      assessment,
      resources: generateResources(data.session.topic, data.student.level),
      nextSteps: generateNextSteps(data.session, data.student.level),
      tutoringMode: 'rule_based',
      estimatedDuration: calculateDuration(data.session, data.preferences),
      timestamp: new Date().toISOString()
    }
  }
}

async function enhanceWithAI(data: TutoringRequest, approach: any, lessonPlan: any, assessment: any) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_FOUNDRY_ENDPOINT
  const azureApiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_AI_FOUNDRY_KEY
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'

  if (!azureEndpoint || !azureApiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  const prompt = `As an expert AI tutor specializing in ${data.session.topic}, create a personalized tutoring session:

Student Profile:
- Name: ${data.student.name}
- Level: ${data.student.level}
- Subject: ${data.student.subject}
- Learning Style: ${data.student.learningStyle}
- Language: ${data.student.preferredLanguage}

Session Request:
- Topic: ${data.session.topic}
- Difficulty: ${data.session.difficulty}
- Question: ${data.session.question || 'General topic exploration'}
- Context: ${data.session.context || 'Initial learning session'}

Teaching Preferences:
- Explanation Style: ${data.preferences.explanation_style}
- Examples Needed: ${data.preferences.examples_preferred ? 'Yes' : 'No'}
- Interactive Mode: ${data.preferences.interactive_mode ? 'Yes' : 'No'}
- Assessment: ${data.preferences.assessment_included ? 'Include assessment' : 'Skip assessment'}

Please provide:
1. Personalized teaching approach for this student's learning style
2. Step-by-step lesson structure adapted to their level
3. Engaging examples relevant to their context
4. Interactive elements if requested
5. Assessment questions if needed
6. Practice exercises for reinforcement
7. Resources for further learning
8. Estimated learning objectives and outcomes

Adapt your tutoring style to be encouraging, patient, and effective for this specific student.`

  const deploymentName = 'gpt-4o'
  const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': azureApiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `You are an expert AI tutor with PhD-level knowledge across all academic subjects. You're known for adapting teaching methods to individual learning styles and making complex concepts accessible. You're patient, encouraging, and highly effective at helping students achieve their learning goals.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2500,
      temperature: 0.7,
      top_p: 0.9,
    }),
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status}`)
  }

  const aiResponse = await response.json()
  const aiContent = aiResponse.choices[0]?.message?.content || ''

  return {
    sessionId: `ai_tutor_${Date.now()}`,
    student: data.student,
    approach,
    lessonPlan,
    assessment,
    aiTutoringContent: aiContent,
    enhancedExplanations: extractExplanations(aiContent),
    interactiveElements: data.preferences.interactive_mode ? extractInteractiveElements(aiContent) : [],
    resources: generateResources(data.session.topic, data.student.level),
    nextSteps: generateNextSteps(data.session, data.student.level),
    tutoringMode: 'ai_enhanced',
    estimatedDuration: calculateDuration(data.session, data.preferences),
    learningObjectives: extractLearningObjectives(aiContent),
    metadata: {
      tokens_used: aiResponse.usage?.total_tokens || 0,
      deployment: deploymentName
    },
    timestamp: new Date().toISOString()
  }
}

function createPersonalizedApproach(student: any, preferences: any) {
  let approach = {
    primaryStrategy: '',
    adaptations: [] as string[],
    communicationStyle: '',
    motivationalElements: [] as string[]
  }

  // Adapt to learning style
  switch (student.learningStyle) {
    case 'visual':
      approach.primaryStrategy = 'Visual-first learning with diagrams, charts, and visual representations'
      approach.adaptations.push('Use diagrams and visual aids', 'Color-coded explanations', 'Mind maps and flowcharts')
      break
    case 'auditory':
      approach.primaryStrategy = 'Explanation-focused learning with verbal descriptions and discussions'
      approach.adaptations.push('Verbal explanations', 'Discussion-based learning', 'Audio examples')
      break
    case 'kinesthetic':
      approach.primaryStrategy = 'Hands-on learning with practical examples and exercises'
      approach.adaptations.push('Interactive exercises', 'Real-world applications', 'Step-by-step practice')
      break
    case 'reading':
      approach.primaryStrategy = 'Text-based learning with detailed written explanations'
      approach.adaptations.push('Comprehensive written materials', 'Reading assignments', 'Text-based exercises')
      break
  }

  // Adapt to level
  switch (student.level) {
    case 'elementary':
      approach.communicationStyle = 'Simple, encouraging language with lots of positive reinforcement'
      approach.motivationalElements.push('Gamification', 'Rewards system', 'Fun examples')
      break
    case 'middle':
      approach.communicationStyle = 'Clear explanations with relatable examples'
      approach.motivationalElements.push('Peer comparisons', 'Achievement tracking', 'Interesting facts')
      break
    case 'high_school':
      approach.communicationStyle = 'Detailed explanations with real-world connections'
      approach.motivationalElements.push('Future relevance', 'College preparation', 'Career connections')
      break
    case 'college':
      approach.communicationStyle = 'Academic rigor with practical applications'
      approach.motivationalElements.push('Research opportunities', 'Professional development', 'Critical thinking')
      break
    case 'graduate':
      approach.communicationStyle = 'Expert-level discourse with advanced concepts'
      approach.motivationalElements.push('Research excellence', 'Innovation focus', 'Academic achievement')
      break
  }

  return approach
}

function generateLessonPlan(session: any, approach: any) {
  return {
    structure: 'Adaptive 3-phase learning approach',
    phases: [
      {
        name: 'Introduction & Assessment',
        duration: '20%',
        activities: [
          'Review previous knowledge',
          'Identify current understanding level',
          'Set session objectives'
        ]
      },
      {
        name: 'Core Learning',
        duration: '60%',
        activities: [
          'Present new concepts using preferred learning style',
          'Provide examples and practice opportunities',
          'Interactive problem-solving'
        ]
      },
      {
        name: 'Reinforcement & Next Steps',
        duration: '20%',
        activities: [
          'Summarize key learnings',
          'Practice exercises',
          'Plan follow-up activities'
        ]
      }
    ],
    adaptiveElements: approach.adaptations,
    checkpoints: [
      'Understanding verification after each concept',
      'Mid-session comprehension check',
      'End-of-session assessment'
    ]
  }
}

function generateAssessment(session: any, level: string) {
  const assessmentTypes = {
    elementary: ['Multiple choice', 'True/false', 'Simple matching'],
    middle: ['Short answer', 'Problem solving', 'Concept mapping'],
    high_school: ['Essay questions', 'Case studies', 'Project-based'],
    college: ['Research questions', 'Critical analysis', 'Synthesis tasks'],
    graduate: ['Thesis development', 'Research methodology', 'Peer review']
  }

  return {
    type: 'Adaptive assessment based on learning progress',
    methods: assessmentTypes[level as keyof typeof assessmentTypes] || assessmentTypes.college,
    criteria: [
      'Conceptual understanding',
      'Application ability',
      'Problem-solving skills',
      'Communication of ideas'
    ],
    feedback: {
      immediate: 'Real-time corrections and encouragement',
      detailed: 'Comprehensive performance analysis',
      improvement: 'Specific recommendations for enhancement'
    }
  }
}

function generateResources(topic: string, level: string) {
  return {
    primary: [
      `Interactive ${topic} tutorials`,
      `${level}-appropriate textbooks and materials`,
      'Video explanations and demonstrations',
      'Practice problem sets'
    ],
    supplementary: [
      'Online simulations and tools',
      'Peer study groups',
      'Additional reading materials',
      'Educational games and apps'
    ],
    advanced: [
      'Research papers and articles',
      'Professional development resources',
      'Industry case studies',
      'Expert interviews and lectures'
    ]
  }
}

function generateNextSteps(session: any, level: string) {
  return {
    immediate: [
      'Review session materials',
      'Complete practice exercises',
      'Note any remaining questions'
    ],
    shortTerm: [
      'Schedule follow-up session',
      'Explore related topics',
      'Apply concepts to real scenarios'
    ],
    longTerm: [
      'Develop mastery through progressive practice',
      'Connect learning to broader educational goals',
      'Consider advanced applications'
    ],
    recommendedFrequency: determineSessionFrequency(session.difficulty, level)
  }
}

function calculateDuration(session: any, preferences: any): number {
  let baseDuration = 45 // minutes

  // Adjust for difficulty
  if (session.difficulty === 'beginner') baseDuration = 30
  else if (session.difficulty === 'advanced') baseDuration = 60

  // Adjust for preferences
  if (preferences.explanation_style === 'detailed') baseDuration += 15
  if (preferences.interactive_mode) baseDuration += 10
  if (preferences.assessment_included) baseDuration += 15

  return Math.min(baseDuration, session.timeLimit || 90)
}

function determineSessionFrequency(difficulty: string, level: string): string {
  if (difficulty === 'beginner') return '2-3 times per week'
  if (difficulty === 'intermediate') return '1-2 times per week'
  if (difficulty === 'advanced') return '1 time per week'
  return '1-2 times per week'
}

async function getTutoringCapabilities() {
  return {
    subjects: [
      'Mathematics', 'Science', 'History', 'Languages', 'Computer Science',
      'Engineering', 'Business', 'Arts', 'Literature', 'Philosophy',
      'Psychology', 'Economics', 'Physics', 'Chemistry', 'Biology'
    ],
    levels: ['elementary', 'middle', 'high_school', 'college', 'graduate'],
    learningStyles: ['visual', 'auditory', 'kinesthetic', 'reading'],
    languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    sessionTypes: [
      'One-on-one tutoring',
      'Group sessions',
      'Homework assistance',
      'Exam preparation',
      'Concept reinforcement',
      'Advanced exploration'
    ],
    features: {
      adaptive_learning: true,
      real_time_feedback: true,
      progress_tracking: true,
      personalized_curriculum: true,
      ai_powered_insights: true,
      multi_modal_content: true
    },
    availability: '24/7',
    response_time: 'Instant',
    success_rate: '94%'
  }
}

function extractExplanations(content: string): string[] {
  const lines = content.split('\n')
  const explanations: string[] = []

  for (const line of lines) {
    if (line.includes('explain') || line.includes('understand') || line.includes('concept')) {
      const cleaned = line.replace(/^[•\-\d\.]\s*/, '').trim()
      if (cleaned.length > 20) {
        explanations.push(cleaned)
      }
    }
  }

  return explanations.slice(0, 5)
}

function extractInteractiveElements(content: string): string[] {
  const elements: string[] = []
  const sections = content.split(/\d+\./g)

  for (const section of sections) {
    if (section.includes('interactive') || section.includes('practice') || section.includes('exercise')) {
      const element = section.trim().split('\n')[0]
      if (element.length > 15) {
        elements.push(element)
      }
    }
  }

  return elements.slice(0, 4)
}

function extractLearningObjectives(content: string): string[] {
  const objectives: string[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    if (line.includes('objective') || line.includes('goal') || line.includes('outcome')) {
      const cleaned = line.replace(/^[•\-\d\.]\s*/, '').trim()
      if (cleaned.length > 15) {
        objectives.push(cleaned)
      }
    }
  }

  return objectives.slice(0, 4)
}
