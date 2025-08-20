/**
 * Financial Services for BancAI MCP Server
 */

import { Decimal } from 'decimal.js';
import { logger } from '../utils/logger.js';

/**
 * Account types supported by BancAI
 */
export enum AccountType {
    CHECKING = 'checking',
    SAVINGS = 'savings',
    CREDIT = 'credit',
    LOAN = 'loan',
    INVESTMENT = 'investment',
}

/**
 * Transaction types
 */
export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    TRANSFER = 'transfer',
    PAYMENT = 'payment',
    INTEREST = 'interest',
    FEE = 'fee',
}

/**
 * Account information interface
 */
export interface Account {
    id: string;
    userId: string;
    accountNumber: string;
    accountType: AccountType;
    balance: Decimal;
    currency: string;
    status: 'active' | 'suspended' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Transaction interface
 */
export interface Transaction {
    id: string;
    accountId: string;
    amount: Decimal;
    currency: string;
    type: TransactionType;
    description: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    timestamp: Date;
    metadata?: Record<string, any>;
}

/**
 * Financial calculation result
 */
export interface FinancialCalculation {
    type: string;
    inputs: Record<string, any>;
    result: number | Decimal;
    currency?: string;
    explanation: string;
    formula?: string;
}

/**
 * Financial Services Class
 */
export class FinancialServices {
    /**
     * Calculate compound interest
     */
    static calculateCompoundInterest(
        principal: number,
        rate: number,
        time: number,
        compoundingFrequency: number = 12
    ): FinancialCalculation {
        const P = new Decimal(principal);
        const r = new Decimal(rate).div(100);
        const n = new Decimal(compoundingFrequency);
        const t = new Decimal(time);

        // A = P(1 + r/n)^(nt)
        const amount = P.mul(
            r.div(n).plus(1).pow(n.mul(t))
        );

        const interest = amount.minus(P);

        logger.info('Calculated compound interest', {
            principal,
            rate,
            time,
            compoundingFrequency,
            result: amount.toNumber(),
        });

        return {
            type: 'compound_interest',
            inputs: { principal, rate, time, compoundingFrequency },
            result: amount,
            explanation: `With a principal of ${P.toFixed(2)}, annual interest rate of ${rate}%, compounded ${compoundingFrequency} times per year for ${time} years, the total amount is ${amount.toFixed(2)} with interest earned of ${interest.toFixed(2)}.`,
            formula: 'A = P(1 + r/n)^(nt)',
        };
    }

    /**
     * Calculate loan payment (EMI)
     */
    static calculateLoanPayment(
        loanAmount: number,
        annualRate: number,
        loanTermMonths: number
    ): FinancialCalculation {
        const P = new Decimal(loanAmount);
        const r = new Decimal(annualRate).div(100).div(12); // Monthly rate
        const n = new Decimal(loanTermMonths);

        // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        const numerator = P.mul(r).mul(r.plus(1).pow(n));
        const denominator = r.plus(1).pow(n).minus(1);
        const emi = numerator.div(denominator);

        const totalPayment = emi.mul(n);
        const totalInterest = totalPayment.minus(P);

        logger.info('Calculated loan payment', {
            loanAmount,
            annualRate,
            loanTermMonths,
            emi: emi.toNumber(),
        });

        return {
            type: 'loan_payment',
            inputs: { loanAmount, annualRate, loanTermMonths },
            result: emi,
            explanation: `For a loan of ${P.toFixed(2)} at ${annualRate}% annual rate for ${loanTermMonths} months, the monthly payment (EMI) is ${emi.toFixed(2)}. Total payment: ${totalPayment.toFixed(2)}, Total interest: ${totalInterest.toFixed(2)}.`,
            formula: 'EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)',
        };
    }

    /**
     * Calculate future value of investment
     */
    static calculateFutureValue(
        presentValue: number,
        rate: number,
        time: number,
        paymentAmount: number = 0,
        paymentFrequency: number = 12
    ): FinancialCalculation {
        const PV = new Decimal(presentValue);
        const r = new Decimal(rate).div(100).div(paymentFrequency);
        const n = new Decimal(time * paymentFrequency);
        const PMT = new Decimal(paymentAmount);

        // FV = PV(1 + r)^n + PMT * [((1 + r)^n - 1) / r]
        const futureValueLumpSum = PV.mul(r.plus(1).pow(n));

        let futureValueAnnuity = new Decimal(0);
        if (paymentAmount > 0) {
            futureValueAnnuity = PMT.mul(
                r.plus(1).pow(n).minus(1).div(r)
            );
        }

        const totalFutureValue = futureValueLumpSum.plus(futureValueAnnuity);

        logger.info('Calculated future value', {
            presentValue,
            rate,
            time,
            paymentAmount,
            result: totalFutureValue.toNumber(),
        });

        return {
            type: 'future_value',
            inputs: { presentValue, rate, time, paymentAmount, paymentFrequency },
            result: totalFutureValue,
            explanation: `With present value of ${PV.toFixed(2)}, ${rate}% annual rate, and ${paymentAmount > 0 ? `monthly payments of ${PMT.toFixed(2)}` : 'no additional payments'} for ${time} years, the future value will be ${totalFutureValue.toFixed(2)}.`,
            formula: 'FV = PV(1 + r)^n + PMT * [((1 + r)^n - 1) / r]',
        };
    }

    /**
     * Validate account number format
     */
    static validateAccountNumber(accountNumber: string): boolean {
        // Simple validation - can be extended for specific bank formats
        const accountNumberRegex = /^\d{10,16}$/;
        return accountNumberRegex.test(accountNumber);
    }

    /**
     * Validate IBAN format
     */
    static validateIBAN(iban: string): boolean {
        // Basic IBAN validation
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
        return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
    }

    /**
     * Calculate currency exchange
     */
    static calculateCurrencyExchange(
        amount: number,
        fromCurrency: string,
        toCurrency: string,
        exchangeRate: number
    ): FinancialCalculation {
        const baseAmount = new Decimal(amount);
        const rate = new Decimal(exchangeRate);
        const convertedAmount = baseAmount.mul(rate);

        logger.info('Calculated currency exchange', {
            amount,
            fromCurrency,
            toCurrency,
            exchangeRate,
            result: convertedAmount.toNumber(),
        });

        return {
            type: 'currency_exchange',
            inputs: { amount, fromCurrency, toCurrency, exchangeRate },
            result: convertedAmount,
            currency: toCurrency,
            explanation: `${baseAmount.toFixed(2)} ${fromCurrency} at exchange rate ${rate.toFixed(4)} equals ${convertedAmount.toFixed(2)} ${toCurrency}.`,
        };
    }

    /**
     * Calculate debt-to-income ratio
     */
    static calculateDebtToIncomeRatio(
        monthlyDebt: number,
        monthlyIncome: number
    ): FinancialCalculation {
        const debt = new Decimal(monthlyDebt);
        const income = new Decimal(monthlyIncome);
        const ratio = debt.div(income).mul(100);

        const assessment = ratio.lte(28) ? 'Excellent' :
            ratio.lte(36) ? 'Good' :
                ratio.lte(43) ? 'Fair' : 'Poor';

        logger.info('Calculated debt-to-income ratio', {
            monthlyDebt,
            monthlyIncome,
            ratio: ratio.toNumber(),
            assessment,
        });

        return {
            type: 'debt_to_income_ratio',
            inputs: { monthlyDebt, monthlyIncome },
            result: ratio,
            explanation: `With monthly debt of ${debt.toFixed(2)} and monthly income of ${income.toFixed(2)}, your debt-to-income ratio is ${ratio.toFixed(2)}%. Assessment: ${assessment}.`,
            formula: 'DTI = (Total Monthly Debt / Total Monthly Income) * 100',
        };
    }
}
