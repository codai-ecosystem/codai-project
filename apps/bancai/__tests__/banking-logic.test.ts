import { describe, it, expect } from 'vitest'

describe('BANCAI Banking Logic', () => {
  it('calculates compound interest correctly', () => {
    const principal = 10000 // RON
    const rate = 0.05 // 5% annual rate
    const time = 2 // years
    const compounded = 4 // quarterly
    
    const amount = principal * Math.pow((1 + rate / compounded), compounded * time)
    const interest = amount - principal
    
    expect(interest).toBeCloseTo(1044.86, 2)
  })

  it('validates Romanian IBAN format', () => {
    const validIBAN = 'RO49AAAA1234567890123456'
    const invalidIBAN = 'RO49AAAA123456789012345' // Too short
    
    const validateRomanianIBAN = (iban: string): boolean => {
      const romanianIBANRegex = /^RO\d{2}[A-Z]{4}\d{16}$/
      return romanianIBANRegex.test(iban)
    }
    
    expect(validateRomanianIBAN(validIBAN)).toBe(true)
    expect(validateRomanianIBAN(invalidIBAN)).toBe(false)
  })

  it('calculates loan monthly payment', () => {
    const loanAmount = 100000 // RON
    const annualRate = 0.07 // 7%
    const years = 20
    
    const monthlyRate = annualRate / 12
    const numPayments = years * 12
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    expect(monthlyPayment).toBeCloseTo(775.30, 2)
  })

  it('converts currency with exchange rates', () => {
    const amountInRON = 1000
    const eurToRonRate = 4.95
    
    const convertToEUR = (ron: number, rate: number): number => {
      return ron / rate
    }
    
    const eurAmount = convertToEUR(amountInRON, eurToRonRate)
    expect(eurAmount).toBeCloseTo(202.02, 2)
  })

  it('validates transaction limits', () => {
    const dailyLimit = 5000 // RON
    const currentDailySpent = 3500 // RON
    const transactionAmount = 2000 // RON
    
    const canProcessTransaction = (spent: number, amount: number, limit: number): boolean => {
      return (spent + amount) <= limit
    }
    
    expect(canProcessTransaction(currentDailySpent, transactionAmount, dailyLimit)).toBe(false)
    expect(canProcessTransaction(currentDailySpent, 1000, dailyLimit)).toBe(true)
  })

  it('calculates account balance with transactions', () => {
    const initialBalance = 5000
    const transactions = [
      { type: 'credit', amount: 1000 },
      { type: 'debit', amount: 250 },
      { type: 'credit', amount: 500 },
      { type: 'debit', amount: 100 }
    ]
    
    const calculateBalance = (initial: number, txns: any[]): number => {
      return txns.reduce((balance, txn) => {
        return txn.type === 'credit' 
          ? balance + txn.amount 
          : balance - txn.amount
      }, initial)
    }
    
    const finalBalance = calculateBalance(initialBalance, transactions)
    expect(finalBalance).toBe(6150)
  })
})
