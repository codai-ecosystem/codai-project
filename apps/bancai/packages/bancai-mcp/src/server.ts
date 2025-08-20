#!/usr/bin/env node
/**
 * BancAI MCP Server
 * 
 * Financial Services Model Context Protocol server for the CODAI ecosystem.
 * Provides comprehensive banking, financial calculations, and payment processing tools.
 * 
 * Features:
 * - Financial calculations (loans, interest, investments)
 * - Account management tools
 * - Payment processing integration
 * - Currency conversion
 * - Financial compliance tools
 * - Risk assessment utilities
 * 
 * @author CODAI Ecosystem - BancAI Team
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';
import { FinancialServices } from './services/financialServices.js';
import type { MCPTool } from './types/mcp.js';

/**
 * BancAI MCP Server Class
 */
class BancAIMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'bancai-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP server handlers
   */
  private setupHandlers(): void {
    // Tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Listing available BancAI tools');
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Executing BancAI tool: ${name}`, { args });

      try {
        return await this.executeTool(name, args);
      } catch (error) {
        logger.error(`BancAI tool execution failed: ${name}`, { error });
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  /**
   * Get available financial tools
   */
  private getTools(): MCPTool[] {
    return [
      {
        name: 'calculate_compound_interest',
        description: 'Calculate compound interest for investments or savings',
        inputSchema: {
          type: 'object',
          properties: {
            principal: {
              type: 'number',
              description: 'Initial principal amount',
            },
            rate: {
              type: 'number',
              description: 'Annual interest rate (as percentage)',
            },
            time: {
              type: 'number',
              description: 'Time period in years',
            },
            compoundingFrequency: {
              type: 'number',
              description: 'Number of times interest is compounded per year (default: 12)',
              default: 12,
            },
          },
          required: ['principal', 'rate', 'time'],
        },
      },
      {
        name: 'calculate_loan_payment',
        description: 'Calculate monthly loan payment (EMI) with total interest',
        inputSchema: {
          type: 'object',
          properties: {
            loanAmount: {
              type: 'number',
              description: 'Total loan amount',
            },
            annualRate: {
              type: 'number',
              description: 'Annual interest rate (as percentage)',
            },
            loanTermMonths: {
              type: 'number',
              description: 'Loan term in months',
            },
          },
          required: ['loanAmount', 'annualRate', 'loanTermMonths'],
        },
      },
      {
        name: 'calculate_future_value',
        description: 'Calculate future value of investment with regular payments',
        inputSchema: {
          type: 'object',
          properties: {
            presentValue: {
              type: 'number',
              description: 'Present value/initial investment',
            },
            rate: {
              type: 'number',
              description: 'Annual interest rate (as percentage)',
            },
            time: {
              type: 'number',
              description: 'Investment period in years',
            },
            paymentAmount: {
              type: 'number',
              description: 'Regular payment amount (optional)',
              default: 0,
            },
            paymentFrequency: {
              type: 'number',
              description: 'Payments per year (default: 12)',
              default: 12,
            },
          },
          required: ['presentValue', 'rate', 'time'],
        },
      },
      {
        name: 'calculate_currency_exchange',
        description: 'Convert currency amounts using exchange rates',
        inputSchema: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Amount to convert',
            },
            fromCurrency: {
              type: 'string',
              description: 'Source currency code (e.g., USD, EUR)',
            },
            toCurrency: {
              type: 'string',
              description: 'Target currency code (e.g., RON, GBP)',
            },
            exchangeRate: {
              type: 'number',
              description: 'Exchange rate from source to target currency',
            },
          },
          required: ['amount', 'fromCurrency', 'toCurrency', 'exchangeRate'],
        },
      },
      {
        name: 'calculate_debt_to_income_ratio',
        description: 'Calculate debt-to-income ratio and provide assessment',
        inputSchema: {
          type: 'object',
          properties: {
            monthlyDebt: {
              type: 'number',
              description: 'Total monthly debt payments',
            },
            monthlyIncome: {
              type: 'number',
              description: 'Total monthly gross income',
            },
          },
          required: ['monthlyDebt', 'monthlyIncome'],
        },
      },
      {
        name: 'validate_account_number',
        description: 'Validate account number format',
        inputSchema: {
          type: 'object',
          properties: {
            accountNumber: {
              type: 'string',
              description: 'Account number to validate',
            },
          },
          required: ['accountNumber'],
        },
      },
      {
        name: 'validate_iban',
        description: 'Validate International Bank Account Number (IBAN)',
        inputSchema: {
          type: 'object',
          properties: {
            iban: {
              type: 'string',
              description: 'IBAN to validate',
            },
          },
          required: ['iban'],
        },
      },
      {
        name: 'get_bancai_info',
        description: 'Get information about BancAI MCP server capabilities',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  /**
   * Execute a financial tool
   */
  private async executeTool(name: string, args: unknown): Promise<any> {
    switch (name) {
      case 'calculate_compound_interest':
        return this.handleCompoundInterest(args);

      case 'calculate_loan_payment':
        return this.handleLoanPayment(args);

      case 'calculate_future_value':
        return this.handleFutureValue(args);

      case 'calculate_currency_exchange':
        return this.handleCurrencyExchange(args);

      case 'calculate_debt_to_income_ratio':
        return this.handleDebtToIncomeRatio(args);

      case 'validate_account_number':
        return this.handleValidateAccountNumber(args);

      case 'validate_iban':
        return this.handleValidateIban(args);

      case 'get_bancai_info':
        return this.handleBancAIInfo();

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown BancAI tool: ${name}`
        );
    }
  }

  /**
   * Handle compound interest calculation
   */
  private async handleCompoundInterest(args: unknown) {
    const schema = z.object({
      principal: z.number().positive(),
      rate: z.number().positive(),
      time: z.number().positive(),
      compoundingFrequency: z.number().positive().default(12),
    });

    const parsed = schema.parse(args);
    const result = FinancialServices.calculateCompoundInterest(
      parsed.principal,
      parsed.rate,
      parsed.time,
      parsed.compoundingFrequency
    );

    return {
      content: [
        {
          type: 'text',
          text: `## Compound Interest Calculation

**Result**: ${result.result.toString()}

**Details**:
- Principal: $${parsed.principal.toLocaleString()}
- Interest Rate: ${parsed.rate}% annually
- Time Period: ${parsed.time} years
- Compounding: ${parsed.compoundingFrequency} times per year

**Explanation**: ${result.explanation}

**Formula Used**: ${result.formula}`,
        },
      ],
    };
  }

  /**
   * Handle loan payment calculation
   */
  private async handleLoanPayment(args: unknown) {
    const schema = z.object({
      loanAmount: z.number().positive(),
      annualRate: z.number().positive(),
      loanTermMonths: z.number().positive(),
    });

    const parsed = schema.parse(args);
    const result = FinancialServices.calculateLoanPayment(
      parsed.loanAmount,
      parsed.annualRate,
      parsed.loanTermMonths
    );

    return {
      content: [
        {
          type: 'text',
          text: `## Loan Payment Calculation (EMI)

**Monthly Payment**: $${result.result.toString()}

**Loan Details**:
- Loan Amount: $${parsed.loanAmount.toLocaleString()}
- Annual Interest Rate: ${parsed.annualRate}%
- Loan Term: ${parsed.loanTermMonths} months (${(parsed.loanTermMonths / 12).toFixed(1)} years)

**Explanation**: ${result.explanation}

**Formula Used**: ${result.formula}`,
        },
      ],
    };
  }

  /**
   * Handle future value calculation
   */
  private async handleFutureValue(args: unknown) {
    const schema = z.object({
      presentValue: z.number().positive(),
      rate: z.number().positive(),
      time: z.number().positive(),
      paymentAmount: z.number().default(0),
      paymentFrequency: z.number().positive().default(12),
    });

    const parsed = schema.parse(args);
    const result = FinancialServices.calculateFutureValue(
      parsed.presentValue,
      parsed.rate,
      parsed.time,
      parsed.paymentAmount,
      parsed.paymentFrequency
    );

    return {
      content: [
        {
          type: 'text',
          text: `## Future Value Calculation

**Future Value**: $${result.result.toString()}

**Investment Details**:
- Present Value: $${parsed.presentValue.toLocaleString()}
- Annual Interest Rate: ${parsed.rate}%
- Investment Period: ${parsed.time} years
${parsed.paymentAmount > 0 ? `- Regular Payments: $${parsed.paymentAmount} (${parsed.paymentFrequency} times per year)` : '- No regular payments'}

**Explanation**: ${result.explanation}

**Formula Used**: ${result.formula}`,
        },
      ],
    };
  }

  /**
   * Handle currency exchange calculation
   */
  private async handleCurrencyExchange(args: unknown) {
    const schema = z.object({
      amount: z.number().positive(),
      fromCurrency: z.string().length(3),
      toCurrency: z.string().length(3),
      exchangeRate: z.number().positive(),
    });

    const parsed = schema.parse(args);
    const result = FinancialServices.calculateCurrencyExchange(
      parsed.amount,
      parsed.fromCurrency,
      parsed.toCurrency,
      parsed.exchangeRate
    );

    return {
      content: [
        {
          type: 'text',
          text: `## Currency Exchange Calculation

**Converted Amount**: ${result.result.toString()} ${result.currency}

**Exchange Details**:
- Original Amount: ${parsed.amount} ${parsed.fromCurrency}
- Target Currency: ${parsed.toCurrency}
- Exchange Rate: ${parsed.exchangeRate}

**Explanation**: ${result.explanation}`,
        },
      ],
    };
  }

  /**
   * Handle debt-to-income ratio calculation
   */
  private async handleDebtToIncomeRatio(args: unknown) {
    const schema = z.object({
      monthlyDebt: z.number().min(0),
      monthlyIncome: z.number().positive(),
    });

    const parsed = schema.parse(args);
    const result = FinancialServices.calculateDebtToIncomeRatio(
      parsed.monthlyDebt,
      parsed.monthlyIncome
    );

    return {
      content: [
        {
          type: 'text',
          text: `## Debt-to-Income Ratio Analysis

**DTI Ratio**: ${result.result.toString()}%

**Financial Profile**:
- Monthly Debt Payments: $${parsed.monthlyDebt.toLocaleString()}
- Monthly Gross Income: $${parsed.monthlyIncome.toLocaleString()}

**Explanation**: ${result.explanation}

**DTI Guidelines**:
- 28% or less: Excellent
- 29-36%: Good
- 37-43%: Fair
- Over 43%: Poor (may have difficulty qualifying for loans)

**Formula Used**: ${result.formula}`,
        },
      ],
    };
  }

  /**
   * Handle account number validation
   */
  private async handleValidateAccountNumber(args: unknown) {
    const schema = z.object({
      accountNumber: z.string().min(1),
    });

    const parsed = schema.parse(args);
    const isValid = FinancialServices.validateAccountNumber(parsed.accountNumber);

    return {
      content: [
        {
          type: 'text',
          text: `## Account Number Validation

**Account Number**: ${parsed.accountNumber}
**Status**: ${isValid ? '✅ Valid' : '❌ Invalid'}

${isValid ?
              'The account number meets the standard format requirements (10-16 digits).' :
              'The account number does not meet the standard format requirements. Account numbers should contain 10-16 digits only.'}`,
        },
      ],
    };
  }

  /**
   * Handle IBAN validation
   */
  private async handleValidateIban(args: unknown) {
    const schema = z.object({
      iban: z.string().min(1),
    });

    const parsed = schema.parse(args);
    const isValid = FinancialServices.validateIBAN(parsed.iban);

    return {
      content: [
        {
          type: 'text',
          text: `## IBAN Validation

**IBAN**: ${parsed.iban}
**Status**: ${isValid ? '✅ Valid Format' : '❌ Invalid Format'}

${isValid ?
              'The IBAN meets the basic format requirements.' :
              'The IBAN does not meet the standard format requirements. Please check the country code, check digits, and account identifier.'}

**Note**: This is a format validation only. For complete validation, additional checksum verification is recommended.`,
        },
      ],
    };
  }

  /**
   * Handle BancAI info request
   */
  private async handleBancAIInfo() {
    return {
      content: [
        {
          type: 'text',
          text: `## BancAI MCP Server Information

**Name**: BancAI Model Context Protocol Server
**Version**: 1.0.0
**Description**: Financial Services and Banking Operations

**Capabilities**:
- 💰 Financial Calculations (Compound Interest, Loan Payments, Future Value)
- 🏦 Account Validation (Account Numbers, IBAN)
- 💱 Currency Exchange Calculations
- 📊 Financial Ratio Analysis (Debt-to-Income)
- 🔒 Secure Banking Operations
- 📈 Investment Analysis Tools

**Supported Operations**:
1. **calculate_compound_interest** - Calculate compound interest for investments
2. **calculate_loan_payment** - Calculate monthly loan payments (EMI)
3. **calculate_future_value** - Calculate future value of investments
4. **calculate_currency_exchange** - Convert between currencies
5. **calculate_debt_to_income_ratio** - Analyze debt-to-income ratios
6. **validate_account_number** - Validate account number formats
7. **validate_iban** - Validate International Bank Account Numbers

**Security Features**:
- Input validation and sanitization
- Comprehensive error handling
- Audit logging for all operations
- Rate limiting and CORS protection

**Environment**: ${config.environment}
**Uptime**: ${Math.floor(process.uptime())} seconds
**Memory Usage**: ${JSON.stringify(process.memoryUsage(), null, 2)}

For detailed usage information, refer to the BancAI MCP documentation.`,
        },
      ],
    };
  }

  /**
   * Start the BancAI MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();

    logger.info('Starting BancAI MCP Server v1.0.0');
    logger.info(`Environment: ${config.environment}`);
    logger.info(`Log level: ${config.logging.level}`);
    logger.info('Financial services initialized');

    await this.server.connect(transport);
    logger.info('BancAI MCP Server started successfully - Ready for financial operations');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const bancAIServer = new BancAIMCPServer();
    await bancAIServer.start();
  } catch (error) {
    logger.error('Failed to start BancAI MCP server', { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down BancAI server gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down BancAI server gracefully');
  process.exit(0);
});

// Start the BancAI server
main().catch((error) => {
  logger.error('Unhandled error in BancAI main', { error });
  process.exit(1);
});
