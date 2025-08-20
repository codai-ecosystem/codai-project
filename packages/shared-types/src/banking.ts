// Banking-specific types for BancAI
export interface BankingAccount extends Account {
  routingNumber?: string;
  accountNumber: string;
  institution: string;
  accountType: 'checking' | 'savings' | 'money_market' | 'cd' | 'business_checking' | 'business_savings';
  interestRate?: number;
  minimumBalance?: number;
  overdraftProtection?: boolean;
  jointAccount?: boolean;
  beneficiaries?: Beneficiary[];
  statements: Statement[];
  alerts: AccountAlert[];
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
  contactInfo: ContactInfo;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Statement {
  id: string;
  accountId: string;
  period: {
    start: Date;
    end: Date;
  };
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  interestEarned?: number;
  fees?: number;
  fileUrl?: string;
  downloadCount: number;
  createdAt: Date;
}

export interface AccountAlert {
  id: string;
  accountId: string;
  type: 'low_balance' | 'large_transaction' | 'foreign_transaction' | 'deposit' | 'withdrawal';
  threshold?: number;
  enabled: boolean;
  method: 'email' | 'sms' | 'push' | 'all';
  createdAt: Date;
}

// Credit Card Types
export interface CreditCard {
  id: string;
  userId: string;
  cardNumber: string; // masked
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  expiryDate: string;
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  minimumPayment: number;
  dueDate: Date;
  interestRate: number;
  rewardsProgram?: RewardsProgram;
  status: 'active' | 'inactive' | 'frozen' | 'cancelled';
  transactions: CreditTransaction[];
  statements: CreditStatement[];
}

export interface RewardsProgram {
  id: string;
  name: string;
  type: 'cashback' | 'points' | 'miles';
  currentBalance: number;
  categories: RewardCategory[];
  redemptionOptions: RedemptionOption[];
}

export interface RewardCategory {
  category: string;
  rate: number; // percentage or points per dollar
  cap?: number;
}

export interface RedemptionOption {
  type: 'statement_credit' | 'gift_card' | 'travel' | 'merchandise';
  minAmount: number;
  rate: number; // value per point/mile
}

export interface CreditTransaction extends Transaction {
  cardId: string;
  merchantCategory: string;
  rewardsEarned?: number;
  foreignTransaction?: boolean;
  disputeStatus?: 'none' | 'pending' | 'resolved' | 'closed';
}

export interface CreditStatement {
  id: string;
  cardId: string;
  period: {
    start: Date;
    end: Date;
  };
  previousBalance: number;
  newCharges: number;
  payments: number;
  credits: number;
  newBalance: number;
  minimumPayment: number;
  dueDate: Date;
  interestCharged: number;
  fileUrl?: string;
}

// Loan Types
export interface Loan {
  id: string;
  userId: string;
  type: 'personal' | 'auto' | 'mortgage' | 'home_equity' | 'business' | 'student';
  status: 'active' | 'paid_off' | 'defaulted' | 'in_review';
  principal: number;
  currentBalance: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  nextPaymentDate: Date;
  originationDate: Date;
  maturityDate: Date;
  collateral?: Collateral;
  payments: LoanPayment[];
  documents: LoanDocument[];
}

export interface Collateral {
  type: 'vehicle' | 'property' | 'securities' | 'other';
  description: string;
  value: number;
  appraisalDate?: Date;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  principal: number;
  interest: number;
  escrow?: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'scheduled' | 'paid' | 'late' | 'missed';
  lateFee?: number;
}

export interface LoanDocument {
  id: string;
  loanId: string;
  type: 'note' | 'disclosure' | 'statement' | 'tax_document' | 'insurance';
  name: string;
  fileUrl: string;
  uploadDate: Date;
  size: number;
}

// Investment Types (for BancAI investment services)
export interface InvestmentAccount {
  id: string;
  userId: string;
  accountType: 'ira' | 'roth_ira' | '401k' | 'brokerage' | 'education';
  totalValue: number;
  cashBalance: number;
  investedAmount: number;
  gainLoss: number;
  gainLossPercent: number;
  holdings: Holding[];
  transactions: InvestmentTransaction[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  goals: InvestmentGoal[];
}

export interface Holding {
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'option';
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dividendYield?: number;
}

export interface InvestmentTransaction {
  id: string;
  accountId: string;
  type: 'buy' | 'sell' | 'dividend' | 'interest' | 'fee' | 'transfer';
  symbol?: string;
  quantity?: number;
  price?: number;
  amount: number;
  date: Date;
  description: string;
  fees?: number;
}

export interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  monthlyContribution: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: string;
}

// Business Banking Types
export interface BusinessAccount extends BankingAccount {
  businessType: 'llc' | 'corporation' | 'partnership' | 'sole_proprietorship';
  ein: string;
  businessName: string;
  industry: string;
  monthlyTransactionLimit?: number;
  merchantServices?: MerchantServices;
  payrollServices?: PayrollServices;
  cashManagement?: CashManagement;
}

export interface MerchantServices {
  id: string;
  businessAccountId: string;
  processingRate: number;
  monthlyVolume: number;
  equipment: MerchantEquipment[];
  settlements: Settlement[];
}

export interface MerchantEquipment {
  id: string;
  type: 'terminal' | 'mobile_reader' | 'online_gateway';
  model: string;
  serialNumber: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Settlement {
  id: string;
  date: Date;
  amount: number;
  transactionCount: number;
  fees: number;
  chargebacks: number;
}

export interface PayrollServices {
  id: string;
  businessAccountId: string;
  employees: Employee[];
  paySchedule: 'weekly' | 'biweekly' | 'monthly';
  nextPayDate: Date;
  totalPayroll: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  payType: 'salary' | 'hourly';
  status: 'active' | 'inactive';
  bankAccount?: string;
}

export interface CashManagement {
  sweepAccount?: string;
  autoInvestment?: boolean;
  concentrationAccount?: string;
  zeroBalanceAccount?: boolean;
}

// Wire Transfer Types
export interface WireTransfer {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  currency: string;
  type: 'domestic' | 'international';
  status: 'pending' | 'sent' | 'received' | 'failed' | 'cancelled';
  recipient: WireRecipient;
  purpose: string;
  reference: string;
  fees: number;
  exchangeRate?: number;
  estimatedArrival: Date;
  actualArrival?: Date;
  createdAt: Date;
}

export interface WireRecipient {
  name: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  bankName: string;
  bankAddress: Address;
  recipientAddress: Address;
}

// Financial Analytics Types
export interface FinancialAnalytics {
  userId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  income: AnalyticsSummary;
  expenses: AnalyticsSummary;
  netWorth: AnalyticsSummary;
  cashFlow: CashFlowData[];
  categoryBreakdown: CategoryBreakdown[];
  trends: TrendData[];
  goals: GoalProgress[];
}

export interface AnalyticsSummary {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface CashFlowData {
  date: Date;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  change: number;
}

export interface TrendData {
  metric: string;
  data: { date: Date; value: number }[];
  trend: 'up' | 'down' | 'stable';
}

export interface GoalProgress {
  goalId: string;
  name: string;
  target: number;
  current: number;
  progress: number;
  onTrack: boolean;
}
