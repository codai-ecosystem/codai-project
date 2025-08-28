import { test, expect, describe, beforeEach } from 'vitest'

describe('🇷🇴 Romanian Word Problem Analyzer', () => {
  const API_BASE = 'http://localhost:6101'
  
  beforeEach(() => {
    // Romanian word analyzer tests - validating cultural context and mathematical extraction
  })

  describe('Basic Romanian Mathematical Problems', () => {
    test('should analyze simple Romanian addition problem', async () => {
      const problem = "Maria are 5 mere și primește încă 3 mere de la mama ei. Câte mere are Maria în total?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      // Validate analysis structure
      expect(result.success).toBe(true)
      expect(result.original_problem).toBe(problem)
      expect(result.normalized_text).toBeDefined()
      
      // Validate key terms extraction
      expect(result.analysis.key_terms).toBeDefined()
      expect(result.analysis.key_terms.length).toBeGreaterThan(0)
      
      // Validate numbers extraction
      expect(result.analysis.extracted_numbers).toContain(5)
      expect(result.analysis.extracted_numbers).toContain(3)
      
      // Validate mathematical expression
      expect(result.analysis.mathematical_expression).toBeDefined()
      
      // Validate cultural context
      expect(result.cultural_context).toBeDefined()
      expect(result.cultural_context.cultural_objects).toContain('mere')
      expect(result.cultural_context.educational_level).toBe('elementary')
      
      // Validate solution
      expect(result.solution).toBeDefined()
      if (result.solution.mathematical_result !== null) {
        expect(parseFloat(result.solution.mathematical_result)).toBe(8)
      }
      
      // Validate confidence
      expect(result.analysis.confidence_score).toBeGreaterThan(0.5)
    })

    test('should analyze Romanian subtraction problem with cultural context', async () => {
      const problem = "Andrei avea 20 de lei și a cheltuit 8 lei pe pâine. Câți lei îi mai rămân?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate currency detection
      expect(result.cultural_context.currency_references).toContain('lei')
      
      // Validate cultural objects
      expect(result.cultural_context.cultural_objects).toContain('pâine')
      
      // Validate mathematical operations
      const operations = result.analysis.mathematical_operations
      expect(operations.length).toBeGreaterThan(0)
      expect(operations.some(op => op.operation_type === 'subtraction')).toBe(true)
      
      // Validate numbers
      expect(result.analysis.extracted_numbers).toContain(20)
      expect(result.analysis.extracted_numbers).toContain(8)
      
      // Validate solution
      if (result.solution.mathematical_result !== null) {
        expect(parseFloat(result.solution.mathematical_result)).toBe(12)
      }
    })

    test('should analyze Romanian multiplication problem', async () => {
      const problem = "Într-o clasă sunt 6 rânduri cu câte 5 elevi fiecare. Câți elevi sunt în total?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate school context
      expect(result.cultural_context.cultural_objects).toContain('elevi')
      expect(result.cultural_context.cultural_objects).toContain('clasă')
      
      // Validate numbers
      expect(result.analysis.extracted_numbers).toContain(6)
      expect(result.analysis.extracted_numbers).toContain(5)
      
      // Validate complexity (should be elementary/secondary)
      expect(['elementary', 'secondary']).toContain(result.analysis.complexity)
      
      // Validate solution
      if (result.solution.mathematical_result !== null) {
        expect(parseFloat(result.solution.mathematical_result)).toBe(30)
      }
    })
  })

  describe('Advanced Romanian Mathematical Problems', () => {
    test('should analyze Romanian division problem with decimals', async () => {
      const problem = "O sumă de 156.50 lei trebuie împărțită egal între 5 copii. Câți lei primește fiecare copil?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate decimal number extraction
      expect(result.analysis.extracted_numbers).toContain(156.50)
      expect(result.analysis.extracted_numbers).toContain(5)
      
      // Validate currency context
      expect(result.cultural_context.currency_references).toContain('lei')
      
      // Validate family context
      expect(result.cultural_context.cultural_objects).toContain('copii')
      
      // Validate division operation
      const operations = result.analysis.mathematical_operations
      expect(operations.some(op => op.operation_type === 'division')).toBe(true)
      
      // Validate solution (156.50 / 5 = 31.30)
      if (result.solution.mathematical_result !== null) {
        expect(parseFloat(result.solution.mathematical_result)).toBeCloseTo(31.30, 2)
      }
    })

    test('should handle Romanian written numbers', async () => {
      const problem = "Ana are douăzeci și trei de căpșuni și îi dă șapte căpșuni Mariei. Câte căpșuni îi rămân?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate compound number extraction (douăzeci și trei = 23)
      expect(result.analysis.extracted_numbers).toContain(23)
      expect(result.analysis.extracted_numbers).toContain(7)
      
      // Validate food context
      expect(result.cultural_context.cultural_objects).toContain('căpșuni')
      
      // Validate solution (23 - 7 = 16)
      if (result.solution.mathematical_result !== null) {
        expect(parseFloat(result.solution.mathematical_result)).toBe(16)
      }
    })

    test('should analyze complex Romanian problem with multiple operations', async () => {
      const problem = "Magazinul vinde mere la 3 lei kilogramul și pere la 4 lei kilogramul. Dacă Maria cumpără 2 kg mere și 3 kg pere, cât plătește în total?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate multiple numbers
      expect(result.analysis.extracted_numbers.length).toBeGreaterThan(3)
      expect(result.analysis.extracted_numbers).toContain(3)
      expect(result.analysis.extracted_numbers).toContain(4)
      expect(result.analysis.extracted_numbers).toContain(2)
      
      // Validate traditional measurements
      expect(result.cultural_context.traditional_measurements.some(m => m.includes('kg'))).toBe(true)
      
      // Validate currency context
      expect(result.cultural_context.currency_references).toContain('lei')
      
      // Validate food context
      expect(result.cultural_context.cultural_objects).toContain('mere')
      expect(result.cultural_context.cultural_objects).toContain('pere')
      
      // Validate complexity (should be secondary or advanced)
      expect(['secondary', 'advanced']).toContain(result.analysis.complexity)
      
      // Expected solution: (2 * 3) + (3 * 4) = 6 + 12 = 18
      if (result.solution.mathematical_result !== null) {
        const resultValue = parseFloat(result.solution.mathematical_result)
        expect(resultValue).toBeCloseTo(18, 0)
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle empty problem', async () => {
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: "" })
      })
      
      expect(response.status).toBe(400)
    })

    test('should handle non-mathematical Romanian text', async () => {
      const problem = "Aceasta este o propoziție în română fără context matematic."
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Should still analyze but with low confidence
      expect(result.analysis.confidence_score).toBeLessThan(0.5)
      expect(result.analysis.extracted_numbers.length).toBe(0)
      expect(result.analysis.mathematical_operations.length).toBe(0)
    })

    test('should handle mixed Romanian-English text', async () => {
      const problem = "Maria are 5 apples și wants to buy 3 more. How many total?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Should extract Romanian elements
      expect(result.analysis.extracted_numbers).toContain(5)
      expect(result.analysis.extracted_numbers).toContain(3)
      
      // Should have moderate confidence due to mixed language
      expect(result.analysis.confidence_score).toBeGreaterThan(0.3)
      expect(result.analysis.confidence_score).toBeLessThan(0.9)
    })
  })

  describe('Cultural Context Validation', () => {
    test('should identify traditional Romanian measurements', async () => {
      const problem = "Fermierul are un teren de 100 metri lungime și 50 metri lățime. Care este suprafața în metri pătrați?"
      
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate measurements detection
      expect(result.cultural_context.traditional_measurements).toContain('metri')
      
      // Validate cultural relevance score
      expect(result.cultural_context.cultural_relevance_score).toBeGreaterThan(0.3)
    })

    test('should assess educational level correctly', async () => {
      const problems = [
        { text: "Ana are 2 mere și primește încă 3. Câte are în total?", expectedLevel: "elementary" },
        { text: "Rezolvă ecuația: 2x + 5 = 13", expectedLevel: "secondary" },
        { text: "Demonstrează că suma unghiurilor unui triunghi este 180°", expectedLevel: "advanced" }
      ]
      
      for (const { text, expectedLevel } of problems) {
        const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem: text })
        })
        
        expect(response.ok).toBe(true)
        const result = await response.json()
        
        expect(result.success).toBe(true)
        expect(result.cultural_context.educational_level).toBe(expectedLevel)
      }
    })
  })

  describe('Performance and Quality', () => {
    test('should complete analysis within reasonable time', async () => {
      const problem = "Într-o grădină sunt 15 trandafiri roșii și 12 trandafiri albi. Câți trandafiri sunt în total?"
      
      const startTime = Date.now()
      const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      })
      const endTime = Date.now()
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      
      // Validate processing time (should be under 5 seconds)
      const processingTime = endTime - startTime
      expect(processingTime).toBeLessThan(5000)
      
      // Validate server-reported processing time
      expect(result.processing_time_ms).toBeGreaterThan(0)
      expect(result.processing_time_ms).toBeLessThan(5000)
    })

    test('should maintain high accuracy for standard problems', async () => {
      const standardProblems = [
        { text: "5 + 3 = ?", expected: 8 },
        { text: "10 - 4 = ?", expected: 6 },
        { text: "7 × 2 = ?", expected: 14 },
        { text: "15 ÷ 3 = ?", expected: 5 }
      ]
      
      for (const { text, expected } of standardProblems) {
        const romanianText = `Calculează: ${text}`
        
        const response = await fetch(`${API_BASE}/api/v1/mathematical-reasoning/analyze-romanian-word-problem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem: romanianText })
        })
        
        expect(response.ok).toBe(true)
        const result = await response.json()
        
        expect(result.success).toBe(true)
        
        if (result.solution.mathematical_result !== null) {
          expect(parseFloat(result.solution.mathematical_result)).toBeCloseTo(expected, 1)
        }
        
        // Validate high confidence for standard problems
        expect(result.analysis.confidence_score).toBeGreaterThan(0.7)
      }
    })
  })
})