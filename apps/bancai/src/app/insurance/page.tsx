'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  Car,
  Home,
  Heart,
  Briefcase,
  Plane,
  Users,
  FileText,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  Download,
  Upload,
  ExternalLink,
  Info,
  Calculator,
  TrendingUp,
  Target,
  Building,
  Eye,
  EyeOff,
  Edit3,
  MoreHorizontal,
  Search,
  Filter,
  Settings,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Zap,
  Bell,
  CreditCard,
  RefreshCw,
  MapPin,
  UserCheck,
  Award,
  Globe,
  Smartphone
} from 'lucide-react';

interface InsurancePolicy {
  id: string;
  type: 'auto' | 'home' | 'life' | 'health' | 'business' | 'travel';
  policyNumber: string;
  provider: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  premium: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  coverage: number;
  deductible?: number;
  nextPayment: string;
  expiryDate: string;
  documents: number;
  claims?: number;
  lastClaim?: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  policyType: string;
  description: string;
  amount: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
  dateSubmitted: string;
  estimatedResolution: string;
  adjuster?: string;
  priority: 'low' | 'medium' | 'high';
}

interface InsuranceProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  coverage: string;
  monthlyPremium: number;
  features: string[];
  rating: number;
  popular: boolean;
  category: string;
  discounts?: string[];
}

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('premium');
  const [viewMode, setViewMode] = useState('grid');

  const policies: InsurancePolicy[] = [
    {
      id: '1',
      type: 'auto',
      policyNumber: 'AUTO-123456789',
      provider: 'SafeGuard Insurance',
      status: 'active',
      premium: 185.50,
      frequency: 'monthly',
      coverage: 250000,
      deductible: 500,
      nextPayment: '2025-02-01',
      expiryDate: '2025-08-15',
      documents: 8,
      claims: 2,
      lastClaim: '2024-11-15'
    },
    {
      id: '2',
      type: 'home',
      policyNumber: 'HOME-987654321',
      provider: 'SecureHome Insurance',
      status: 'active',
      premium: 1420.00,
      frequency: 'annually',
      coverage: 450000,
      deductible: 1000,
      nextPayment: '2025-03-15',
      expiryDate: '2026-03-15',
      documents: 12,
      claims: 1,
      lastClaim: '2024-12-01'
    },
    {
      id: '3',
      type: 'life',
      policyNumber: 'LIFE-456789123',
      provider: 'LifeSecure Corp',
      status: 'active',
      premium: 89.99,
      frequency: 'monthly',
      coverage: 500000,
      nextPayment: '2025-02-01',
      expiryDate: '2045-01-15',
      documents: 6,
      claims: 0
    },
    {
      id: '4',
      type: 'health',
      policyNumber: 'HEALTH-789123456',
      provider: 'HealthFirst Insurance',
      status: 'active',
      premium: 450.00,
      frequency: 'monthly',
      coverage: 1000000,
      deductible: 2500,
      nextPayment: '2025-02-01',
      expiryDate: '2025-12-31',
      documents: 15,
      claims: 3,
      lastClaim: '2024-10-20'
    },
    {
      id: '5',
      type: 'business',
      policyNumber: 'BUS-789456123',
      provider: 'BusinessGuard Pro',
      status: 'pending',
      premium: 320.00,
      frequency: 'monthly',
      coverage: 750000,
      deductible: 1500,
      nextPayment: '2025-02-15',
      expiryDate: '2025-09-30',
      documents: 4,
      claims: 0
    },
    {
      id: '6',
      type: 'travel',
      policyNumber: 'TRAVEL-654321987',
      provider: 'GlobalTravel Insurance',
      status: 'expired',
      premium: 45.00,
      frequency: 'monthly',
      coverage: 100000,
      nextPayment: '',
      expiryDate: '2024-12-31',
      documents: 3,
      claims: 1,
      lastClaim: '2024-08-15'
    }
  ];

  const claims: Claim[] = [
    {
      id: '1',
      claimNumber: 'CLM-20250115-001',
      policyType: 'Auto Insurance',
      description: 'Minor fender bender - rear bumper damage during parking',
      amount: 2850.00,
      status: 'processing',
      dateSubmitted: '2025-01-15',
      estimatedResolution: '2025-01-30',
      adjuster: 'Sarah Johnson',
      priority: 'medium'
    },
    {
      id: '2',
      claimNumber: 'CLM-20241201-002',
      policyType: 'Home Insurance',
      description: 'Water damage from burst pipe in kitchen area',
      amount: 8750.00,
      status: 'paid',
      dateSubmitted: '2024-12-01',
      estimatedResolution: '2024-12-15',
      adjuster: 'Mike Anderson',
      priority: 'high'
    },
    {
      id: '3',
      claimNumber: 'CLM-20241120-003',
      policyType: 'Health Insurance',
      description: 'Emergency room visit and diagnostic imaging',
      amount: 1250.00,
      status: 'approved',
      dateSubmitted: '2024-11-20',
      estimatedResolution: '2024-12-05',
      adjuster: 'Lisa Chen',
      priority: 'low'
    },
    {
      id: '4',
      claimNumber: 'CLM-20240815-004',
      policyType: 'Travel Insurance',
      description: 'Trip cancellation due to medical emergency',
      amount: 3200.00,
      status: 'paid',
      dateSubmitted: '2024-08-15',
      estimatedResolution: '2024-08-30',
      adjuster: 'David Wilson',
      priority: 'medium'
    }
  ];

  const availableProducts: InsuranceProduct[] = [
    {
      id: '1',
      name: 'Premium Auto Coverage',
      type: 'Auto Insurance',
      description: 'Comprehensive coverage with roadside assistance and rental car benefits',
      coverage: 'Up to $500K',
      monthlyPremium: 165.00,
      features: ['24/7 Roadside Assistance', 'Rental Car Coverage', 'Glass Coverage', 'Gap Coverage'],
      rating: 4.8,
      popular: true,
      category: 'vehicle',
      discounts: ['Safe Driver', 'Multi-Policy', 'Good Student']
    },
    {
      id: '2',
      name: 'Homeowner Plus',
      type: 'Home Insurance',
      description: 'Complete home protection with personal property and liability coverage',
      coverage: 'Up to $750K',
      monthlyPremium: 125.00,
      features: ['Personal Property', 'Liability Protection', 'Additional Living Expenses', 'Home Office Coverage'],
      rating: 4.6,
      popular: false,
      category: 'property',
      discounts: ['Security System', 'Claims-Free', 'Bundle Discount']
    },
    {
      id: '3',
      name: 'Term Life Protection',
      type: 'Life Insurance',
      description: '20-year term life insurance with guaranteed level premiums',
      coverage: 'Up to $1M',
      monthlyPremium: 65.00,
      features: ['Guaranteed Premiums', 'Conversion Option', 'Accelerated Benefits', 'Waiver of Premium'],
      rating: 4.9,
      popular: true,
      category: 'life',
      discounts: ['Non-Smoker', 'Annual Payment', 'Health Exam']
    },
    {
      id: '4',
      name: 'Business Shield Pro',
      type: 'Business Insurance',
      description: 'Comprehensive business protection including liability and property',
      coverage: 'Up to $2M',
      monthlyPremium: 285.00,
      features: ['General Liability', 'Property Coverage', 'Business Interruption', 'Cyber Protection'],
      rating: 4.7,
      popular: false,
      category: 'business',
      discounts: ['Safety Program', 'Claims-Free', 'Industry Association']
    },
    {
      id: '5',
      name: 'Global Health Max',
      type: 'Health Insurance',
      description: 'Comprehensive health coverage with worldwide benefits',
      coverage: 'Up to $5M',
      monthlyPremium: 420.00,
      features: ['Worldwide Coverage', 'Prescription Benefits', 'Mental Health', 'Preventive Care'],
      rating: 4.5,
      popular: true,
      category: 'health',
      discounts: ['Wellness Program', 'Family Plan', 'Preventive Care']
    },
    {
      id: '6',
      name: 'Adventure Travel',
      type: 'Travel Insurance',
      description: 'Coverage for adventure travel and extreme sports activities',
      coverage: 'Up to $250K',
      monthlyPremium: 55.00,
      features: ['Adventure Sports', 'Medical Evacuation', 'Trip Cancellation', 'Equipment Protection'],
      rating: 4.4,
      popular: false,
      category: 'travel',
      discounts: ['Frequent Traveler', 'Annual Policy', 'Group Discount']
    }
  ];

  // Calculate totals and metrics
  const totalCoverage = policies.reduce((sum, policy) => sum + policy.coverage, 0);
  const totalPremiums = policies.reduce((sum, policy) => {
    const annualPremium = policy.frequency === 'monthly' ? policy.premium * 12 :
      policy.frequency === 'quarterly' ? policy.premium * 4 : policy.premium;
    return sum + annualPremium;
  }, 0);
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const openClaims = claims.filter(c => ['submitted', 'processing'].includes(c.status)).length;
  const totalClaims = claims.length;
  const paidClaims = claims.filter(c => c.status === 'paid').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield, count: undefined },
    { id: 'policies', label: 'My Policies', icon: FileText, count: policies.length },
    { id: 'claims', label: 'Claims', icon: AlertTriangle, count: totalClaims },
    { id: 'marketplace', label: 'Marketplace', icon: Plus, count: availableProducts.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: undefined },
    { id: 'tools', label: 'Tools', icon: Calculator, count: undefined }
  ];

  const quickActions = [
    { id: 'file_claim', label: 'File Claim', icon: AlertTriangle, color: 'bg-red-500', description: 'Report an incident' },
    { id: 'pay_premium', label: 'Pay Premium', icon: CreditCard, color: 'bg-green-500', description: 'Make payment' },
    { id: 'get_quote', label: 'Get Quote', icon: Calculator, color: 'bg-blue-500', description: 'New coverage' },
    { id: 'download_docs', label: 'Documents', icon: Download, color: 'bg-purple-500', description: 'Policy documents' },
    { id: 'contact_agent', label: 'Contact Agent', icon: Phone, color: 'bg-orange-500', description: 'Speak with agent' },
    { id: 'policy_review', label: 'Review Policy', icon: Eye, color: 'bg-indigo-500', description: 'Coverage review' },
    { id: 'emergency_help', label: 'Emergency', icon: Zap, color: 'bg-red-600', description: '24/7 assistance' },
    { id: 'discounts', label: 'Discounts', icon: Award, color: 'bg-yellow-500', description: 'Save money' }
  ];

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'auto': return Car;
      case 'home': return Home;
      case 'life': return Heart;
      case 'health': return Users;
      case 'business': return Briefcase;
      case 'travel': return Plane;
      default: return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'expired': return 'text-red-700 bg-red-100 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'processing': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'approved': return 'text-green-700 bg-green-100 border-green-200';
      case 'denied': return 'text-red-700 bg-red-100 border-red-200';
      case 'paid': return 'text-green-700 bg-green-100 border-green-200';
      case 'submitted': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Filter and sort policies
  const filteredPolicies = useMemo(() => {
    return policies
      .filter(policy => {
        const matchesSearch = policy.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || policy.type === filterType;
        const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'premium': return b.premium - a.premium;
          case 'coverage': return b.coverage - a.coverage;
          case 'expiry': return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          case 'provider': return a.provider.localeCompare(b.provider);
          default: return 0;
        }
      });
  }, [policies, searchTerm, filterType, filterStatus, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Insurance Center</h1>
                  <p className="text-green-100 max-w-2xl">
                    Comprehensive insurance management with AI-powered insights and 24/7 support
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={() => setShowBalances(!showBalances)}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title={showBalances ? 'Hide balances' : 'Show balances'}
                  >
                    {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Bell className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-sm text-green-100">Total Coverage</p>
                      <p className="text-xl font-bold">
                        {showBalances ? formatCurrency(totalCoverage) : '••••••••'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-sm text-green-100">Annual Premiums</p>
                      <p className="text-xl font-bold">
                        {showBalances ? formatCurrency(totalPremiums) : '••••••'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-sm text-green-100">Active Policies</p>
                      <p className="text-xl font-bold">{activePolicies}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-sm text-green-100">Open Claims</p>
                      <p className="text-xl font-bold">{openClaims}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'claims' && renderClaims()}
        {activeTab === 'marketplace' && renderMarketplace()}
      </div>
    </div>
  );

  function renderOverview() {
    return (
      <div className="space-y-8">
        {/* Coverage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Coverage</p>
                <p className="text-2xl font-bold text-blue-600">$2.2M</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Premiums</p>
                <p className="text-2xl font-bold text-green-600">$725.49</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Claims</p>
                <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Policy Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Policy Overview</h3>
          <div className="grid gap-4">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg">
                    {getInsuranceIcon(policy.type)}
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">{policy.type} Insurance</h4>
                    <p className="text-sm text-gray-600">{policy.provider} • {policy.policyNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(policy.coverage)}</p>
                    <p className="text-sm text-gray-600">Coverage</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(policy.premium)}</p>
                    <p className="text-sm text-gray-600">{policy.frequency}</p>
                  </div>

                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Premium Payment Processed</p>
                <p className="text-sm text-gray-600">Auto Insurance premium of $185.50 was successfully processed</p>
                <p className="text-xs text-gray-500">January 15, 2025</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">Claim Under Review</p>
                <p className="text-sm text-gray-600">Auto insurance claim CLM-20250115-001 is being processed</p>
                <p className="text-xs text-gray-500">January 15, 2025</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Claim Paid</p>
                <p className="text-sm text-gray-600">Home insurance claim of $8,750 has been paid to your account</p>
                <p className="text-xs text-gray-500">December 15, 2024</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function renderPolicies() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">My Insurance Policies</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add New Policy
          </button>
        </div>

        <div className="grid gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {getInsuranceIcon(policy.type)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold capitalize">{policy.type} Insurance</h4>
                    <p className="text-gray-600">{policy.provider}</p>
                    <p className="text-sm text-gray-500">Policy: {policy.policyNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Coverage Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(policy.coverage)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Premium</p>
                  <p className="font-semibold text-lg">
                    {formatCurrency(policy.premium)}
                    <span className="text-sm text-gray-500">/{policy.frequency}</span>
                  </p>
                </div>

                {policy.deductible && (
                  <div>
                    <p className="text-sm text-gray-600">Deductible</p>
                    <p className="font-semibold text-lg">{formatCurrency(policy.deductible)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Next Payment</p>
                  <p className="font-semibold text-lg">{policy.nextPayment}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  File Claim
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Download Policy
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderClaims() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Insurance Claims</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            File New Claim
          </button>
        </div>

        <div className="grid gap-6">
          {claims.map((claim) => (
            <Card key={claim.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg">Claim #{claim.claimNumber}</h4>
                  <p className="text-gray-600">{claim.policyType}</p>
                  <p className="text-sm text-gray-500">Submitted: {claim.dateSubmitted}</p>
                </div>

                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(claim.status)}`}>
                  {claim.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{claim.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Claim Amount</p>
                  <p className="font-semibold">{formatCurrency(claim.amount)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold capitalize">{claim.status}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Est. Resolution</p>
                  <p className="font-semibold">{claim.estimatedResolution}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Upload Documents
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Contact Adjuster
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderMarketplace() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Insurance Marketplace</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Get Quote
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableProducts.map((product) => (
            <Card key={product.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{product.name}</h4>
                  <p className="text-gray-600">{product.type}</p>
                </div>

                {product.popular && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Popular
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-4">{product.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-semibold">{product.coverage}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Premium</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(product.monthlyPremium)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-gray-700">Key Features:</p>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Get Quote
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Center</h1>
            <p className="text-gray-600">Manage your insurance policies, file claims, and discover new coverage options</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'policies' && renderPolicies()}
          {activeTab === 'claims' && renderClaims()}
          {activeTab === 'marketplace' && renderMarketplace()}
          {activeTab === 'tools' && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance Tools</h3>
              <p className="text-gray-600">Coverage calculators and comparison tools coming soon</p>
            </div>
          )}
          {/* Enhanced Tabbed Navigation */}
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
              <nav className="flex space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-1 justify-center`}
                    >
                      <Icon className={`${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } -ml-0.5 mr-2 h-5 w-5`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`${activeTab === tab.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-900'
                          } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-center"
                    >
                      <div className={`${action.color} p-3 rounded-lg mx-auto mb-3 w-fit group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Enhanced Coverage Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Coverage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {showBalances ? formatCurrency(totalCoverage) : '••••••••'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Across {activePolicies} active policies
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Annual Premiums</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {showBalances ? formatCurrency(totalPremiums) : '••••••'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(totalPremiums / 12)}/month average
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Claims History</p>
                      <p className="text-2xl font-bold text-gray-900">{totalClaims}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {paidClaims} paid • {openClaims} open
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Policy Types</p>
                      <p className="text-2xl font-bold text-gray-900">{policies.length}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activePolicies} active • {policies.length - activePolicies} inactive
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Premium Payment Processed</p>
                        <p className="text-sm text-gray-600">Auto Insurance premium of $185.50 was successfully processed</p>
                        <p className="text-xs text-gray-500 mt-1">January 15, 2025</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-xl">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Claim Under Review</p>
                        <p className="text-sm text-gray-600">Auto insurance claim CLM-20250115-001 is being processed</p>
                        <p className="text-xs text-gray-500 mt-1">January 15, 2025</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Claim Paid</p>
                        <p className="text-sm text-gray-600">Home insurance claim of $8,750 has been paid to your account</p>
                        <p className="text-xs text-gray-500 mt-1">December 15, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern Footer with Insurance Actions */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="text-lg font-bold mb-2">Insurance Calculator</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Calculate optimal coverage amounts and compare premium options
                </p>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Calculate Coverage
                </button>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="text-lg font-bold mb-2">Claims Center</h3>
                <p className="text-green-100 text-sm mb-4">
                  File new claims and track existing ones with 24/7 support
                </p>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  File Claim
                </button>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Award className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="text-lg font-bold mb-2">Policy Optimization</h3>
                <p className="text-purple-100 text-sm mb-4">
                  AI-powered recommendations to optimize coverage and save money
                </p>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Optimize Policies
                </button>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
