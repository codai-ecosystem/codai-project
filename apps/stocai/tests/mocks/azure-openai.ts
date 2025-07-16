// Enhanced Azure OpenAI Mock for Production Testing
import { vi } from 'vitest'

// Advanced mock responses for different scenarios
const mockResponses = {
    dataset_analysis: {
        romanian: `Analiza dataset-ului:
1. Scop și cazuri de utilizare: Dataset-ul pare să fie bine structurat pentru analiza datelor
2. Evaluarea calității datelor: Calitate bună cu structură consistentă
3. Insight-uri potențiale: Posibilități de analiză predictivă și identificare de pattern-uri
4. Recomandări: Implementarea validării datelor și optimizarea pentru performanță`,

        english: `Dataset Analysis:
1. Purpose and use cases: Well-structured dataset suitable for data analysis
2. Data quality assessment: Good quality with consistent structure
3. Potential insights: Predictive analysis and pattern identification opportunities
4. Recommendations: Implement data validation and optimize for performance`
    },

    file_analysis: {
        romanian: `Analiza fișierului:
- Tipul fișierului este compatibil cu sistemul
- Dimensiunea este optimă pentru procesare
- Conținutul pare să fie valid și structurat
- Recomandări: Verificarea periodică a integrității`,

        english: `File Analysis:
- File type is compatible with the system
- Size is optimal for processing
- Content appears valid and structured
- Recommendations: Regular integrity checks`
    },

    error_response: `Scuze, nu am putut procesa cererea. Vă rugăm să încercați din nou.`,

    performance_insights: `Analiză performanță:
- Timpul de răspuns: Optim
- Utilizarea resurselor: Eficientă
- Scalabilitate: Excelentă
- Recomandări: Monitorizarea continuă`
}

export const azureOpenAI = {
    chat: {
        completions: {
            create: vi.fn().mockImplementation(async (request: any) => {
                // Simulate realistic response times
                await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

                // Analyze request content to provide appropriate response
                const content = request.messages?.[0]?.content || ''
                const isRomanian = content.includes('Romanian') || content.includes('Respond in Romanian')

                let responseContent = mockResponses.error_response

                if (content.includes('dataset') || content.includes('Dataset')) {
                    responseContent = isRomanian ?
                        mockResponses.dataset_analysis.romanian :
                        mockResponses.dataset_analysis.english
                } else if (content.includes('file') || content.includes('File')) {
                    responseContent = isRomanian ?
                        mockResponses.file_analysis.romanian :
                        mockResponses.file_analysis.english
                } else if (content.includes('performance') || content.includes('Performance')) {
                    responseContent = mockResponses.performance_insights
                }

                return {
                    choices: [{
                        message: {
                            content: responseContent
                        },
                        index: 0,
                        finish_reason: 'stop'
                    }],
                    usage: {
                        prompt_tokens: Math.floor(content.length / 4),
                        completion_tokens: Math.floor(responseContent.length / 4),
                        total_tokens: Math.floor((content.length + responseContent.length) / 4)
                    },
                    model: request.model || 'gpt-4',
                    created: Date.now()
                }
            })
        }
    }
}

// Production-ready error simulation
export const simulateAIError = () => {
    azureOpenAI.chat.completions.create = vi.fn().mockRejectedValue(
        new Error('AI Service temporarily unavailable')
    )
}

// Reset mock to default behavior
export const resetAIMock = () => {
    azureOpenAI.chat.completions.create = vi.fn().mockImplementation(async (request: any) => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
            choices: [{
                message: {
                    content: mockResponses.dataset_analysis.romanian
                }
            }]
        }
    })
}

export default azureOpenAI
