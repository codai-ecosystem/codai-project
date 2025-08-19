'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Supply Chain Icons
    Truck,
    Package,
    Warehouse,
    MapPin,
    Route,
    Clock,

    // Inventory Icons
    Archive,
    BarChart4,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    AlertTriangle,

    // Supplier Icons
    Building2,
    Users,
    Star,
    ThumbsUp,
    ThumbsDown,
    Phone,

    // Logistics Icons
    Navigation,
    Compass,
    Timer,
    Fuel,
    DollarSign,
    Calculator,

    // Analytics Icons
    PieChart,
    BarChart3,
    LineChart,
    Activity,
    Target,
    Zap,

    // Control Icons
    Settings,
    Search,
    Filter,
    Download,
    Upload,
    Plus,

    // Status Icons
    CheckCircle2,
    XCircle,
    Circle,
    AlertCircle,
    Info,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react'

// Enhanced Supply Chain Interfaces
interface InventoryItem {
    id: string
    name: string
    sku: string
    category: 'raw_materials' | 'components' | 'finished_goods' | 'packaging' | 'tools' | 'consumables'

    // Stock Information
    currentStock: number
    minStock: number
    maxStock: number
    reorderPoint: number
    unit: string

    // Location
    warehouse: string
    location: string
    zone: string
    shelf: string

    // Cost Information
    unitCost: number
    totalValue: number
    averageCost: number
    lastPurchasePrice: number

    // Status
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued'
    lastRestocked: string
    nextRestock?: string

    // Supplier Information
    primarySupplier: string
    alternativeSuppliers: string[]
    leadTime: number // days

    // Quality
    qualityGrade: 'A' | 'B' | 'C'
    expiryDate?: string
    batchNumber?: string
}

interface Supplier {
    id: string
    name: string
    type: 'manufacturer' | 'distributor' | 'service_provider' | 'logistics'

    // Contact Information
    contactPerson: string
    email: string
    phone: string
    address: string
    website?: string

    // Performance Metrics
    rating: number // 1-5 stars
    onTimeDelivery: number // percentage
    qualityScore: number // percentage
    responseTime: number // hours
    defectRate: number // percentage

    // Business Information
    certifications: string[]
    paymentTerms: string
    leadTime: number // days
    minimumOrder: number

    // Relationship
    relationshipDuration: number // months
    totalOrders: number
    totalValue: number
    lastOrder: string

    // Status
    status: 'active' | 'inactive' | 'under_review' | 'suspended'
    riskLevel: 'low' | 'medium' | 'high'

    // Capabilities
    capabilities: string[]
    capacityUtilization: number // percentage
}

interface Shipment {
    id: string
    type: 'inbound' | 'outbound' | 'internal_transfer'
    status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled'

    // Route Information
    origin: string
    destination: string
    carrier: string
    trackingNumber: string

    // Timing
    scheduledPickup: string
    actualPickup?: string
    estimatedDelivery: string
    actualDelivery?: string

    // Contents
    items: {
        itemId: string
        quantity: number
        weight: number
        value: number
    }[]

    // Logistics
    totalWeight: number
    totalValue: number
    shippingCost: number
    insurance: number

    // Performance
    onTimePerformance: boolean
    damageReported: boolean
    customerSatisfaction?: number
}

interface PurchaseOrder {
    id: string
    supplierId: string
    status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'confirmed' | 'partial_received' | 'completed' | 'cancelled'

    // Order Information
    orderDate: string
    expectedDelivery: string
    actualDelivery?: string

    // Financial
    totalAmount: number
    currency: string
    paymentTerms: string
    paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue'

    // Items
    items: {
        itemId: string
        quantity: number
        unitPrice: number
        totalPrice: number
        receivedQuantity: number
    }[]

    // Approval
    approvedBy?: string
    approvalDate?: string

    // Performance
    leadTimeActual: number
    qualityIssues: boolean
    onTimeDelivery: boolean
}

interface LogisticsRoute {
    id: string
    name: string
    type: 'delivery' | 'pickup' | 'round_trip'

    // Route Details
    waypoints: {
        id: string
        name: string
        address: string
        sequence: number
        estimatedTime: string
        actualTime?: string
    }[]

    // Performance
    totalDistance: number // km
    totalTime: number // hours
    fuelConsumption: number // liters
    cost: number

    // Optimization
    optimizationScore: number // percentage
    carbonFootprint: number // kg CO2
    efficiency: number // percentage

    // Status
    status: 'planned' | 'active' | 'completed' | 'delayed'
    assignedVehicle?: string
    assignedDriver?: string
}

export default function SupplyChain() {
    // Supply Chain State
    const [selectedView, setSelectedView] = useState<'overview' | 'inventory' | 'suppliers' | 'logistics' | 'orders' | 'analytics'>('overview')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [alertsFilter, setAlertsFilter] = useState<'all' | 'critical' | 'low_stock'>('critical')

    // Inventory Data
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
        {
            id: 'inv-001',
            name: 'Steel Sheet 1.5mm',
            sku: 'STL-1.5-001',
            category: 'raw_materials',
            currentStock: 245,
            minStock: 100,
            maxStock: 500,
            reorderPoint: 150,
            unit: 'sheets',
            warehouse: 'Main Warehouse',
            location: 'Zone A',
            zone: 'A',
            shelf: 'A-12-03',
            unitCost: 45.50,
            totalValue: 11147.50,
            averageCost: 45.50,
            lastPurchasePrice: 47.20,
            status: 'in_stock',
            lastRestocked: '2025-08-05T10:00:00Z',
            nextRestock: '2025-08-20T10:00:00Z',
            primarySupplier: 'MetalCorp Industries',
            alternativeSuppliers: ['Steel Solutions Ltd', 'Industrial Metals SA'],
            leadTime: 7,
            qualityGrade: 'A',
            batchNumber: 'BATCH-20250805-001'
        },
        {
            id: 'inv-002',
            name: 'Hydraulic Pump HP-250',
            sku: 'HYD-HP250-002',
            category: 'components',
            currentStock: 12,
            minStock: 20,
            maxStock: 80,
            reorderPoint: 25,
            unit: 'units',
            warehouse: 'Components Storage',
            location: 'Zone B',
            zone: 'B',
            shelf: 'B-08-15',
            unitCost: 1250.00,
            totalValue: 15000.00,
            averageCost: 1250.00,
            lastPurchasePrice: 1275.00,
            status: 'low_stock',
            lastRestocked: '2025-07-28T14:30:00Z',
            nextRestock: '2025-08-12T09:00:00Z',
            primarySupplier: 'HydroTech Systems',
            alternativeSuppliers: ['Pump Solutions Inc', 'Industrial Hydraulics'],
            leadTime: 14,
            qualityGrade: 'A',
            batchNumber: 'HYD-20250728-045'
        },
        {
            id: 'inv-003',
            name: 'Assembly Packaging Box',
            sku: 'PKG-ASM-BOX-003',
            category: 'packaging',
            currentStock: 0,
            minStock: 500,
            maxStock: 2000,
            reorderPoint: 750,
            unit: 'boxes',
            warehouse: 'Packaging Center',
            location: 'Zone C',
            zone: 'C',
            shelf: 'C-05-22',
            unitCost: 2.50,
            totalValue: 0,
            averageCost: 2.50,
            lastPurchasePrice: 2.65,
            status: 'out_of_stock',
            lastRestocked: '2025-08-01T16:00:00Z',
            nextRestock: '2025-08-10T08:00:00Z',
            primarySupplier: 'PackPro Solutions',
            alternativeSuppliers: ['EcoBox Industries', 'Premium Packaging'],
            leadTime: 5,
            qualityGrade: 'B',
            batchNumber: 'PKG-20250801-178'
        },
        {
            id: 'inv-004',
            name: 'Finished Product Widget-A',
            sku: 'FIN-WIDGET-A-004',
            category: 'finished_goods',
            currentStock: 1247,
            minStock: 200,
            maxStock: 2000,
            reorderPoint: 300,
            unit: 'units',
            warehouse: 'Finished Goods',
            location: 'Zone D',
            zone: 'D',
            shelf: 'D-15-08',
            unitCost: 125.75,
            totalValue: 156809.25,
            averageCost: 125.75,
            lastPurchasePrice: 0, // manufactured
            status: 'in_stock',
            lastRestocked: '2025-08-09T12:00:00Z',
            primarySupplier: 'Internal Production',
            alternativeSuppliers: [],
            leadTime: 3,
            qualityGrade: 'A',
            batchNumber: 'PROD-20250809-234'
        }
    ])

    // Suppliers Data
    const [suppliers] = useState<Supplier[]>([
        {
            id: 'sup-001',
            name: 'MetalCorp Industries',
            type: 'manufacturer',
            contactPerson: 'Adrian Popescu',
            email: 'adrian.popescu@metalcorp.ro',
            phone: '+40 21 345 6789',
            address: 'Str. Industriala 45, Bucuresti, Romania',
            website: 'www.metalcorp.ro',
            rating: 4.8,
            onTimeDelivery: 94.5,
            qualityScore: 96.2,
            responseTime: 4.2,
            defectRate: 0.8,
            certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
            paymentTerms: 'Net 30',
            leadTime: 7,
            minimumOrder: 50,
            relationshipDuration: 36,
            totalOrders: 847,
            totalValue: 2450000,
            lastOrder: '2025-08-05T10:00:00Z',
            status: 'active',
            riskLevel: 'low',
            capabilities: ['Steel Processing', 'Custom Fabrication', 'Heat Treatment'],
            capacityUtilization: 78.5
        },
        {
            id: 'sup-002',
            name: 'HydroTech Systems',
            type: 'distributor',
            contactPerson: 'Elena Munteanu',
            email: 'elena.munteanu@hydrotech.ro',
            phone: '+40 21 567 8901',
            address: 'Bd. Techirgiol 123, Cluj-Napoca, Romania',
            website: 'www.hydrotech.ro',
            rating: 4.3,
            onTimeDelivery: 87.8,
            qualityScore: 92.1,
            responseTime: 6.8,
            defectRate: 2.1,
            certifications: ['ISO 9001', 'CE Marking'],
            paymentTerms: 'Net 45',
            leadTime: 14,
            minimumOrder: 5,
            relationshipDuration: 24,
            totalOrders: 234,
            totalValue: 890000,
            lastOrder: '2025-07-28T14:30:00Z',
            status: 'active',
            riskLevel: 'medium',
            capabilities: ['Hydraulic Systems', 'Pneumatic Components', 'Technical Support'],
            capacityUtilization: 85.2
        },
        {
            id: 'sup-003',
            name: 'PackPro Solutions',
            type: 'manufacturer',
            contactPerson: 'Cristian Vasile',
            email: 'cristian.vasile@packpro.ro',
            phone: '+40 21 789 0123',
            address: 'Zona Industriala Sud, Timisoara, Romania',
            rating: 3.9,
            onTimeDelivery: 82.3,
            qualityScore: 88.7,
            responseTime: 8.5,
            defectRate: 3.2,
            certifications: ['FSC Certified', 'PEFC Chain of Custody'],
            paymentTerms: 'Net 15',
            leadTime: 5,
            minimumOrder: 1000,
            relationshipDuration: 18,
            totalOrders: 156,
            totalValue: 234000,
            lastOrder: '2025-08-01T16:00:00Z',
            status: 'under_review',
            riskLevel: 'medium',
            capabilities: ['Cardboard Packaging', 'Custom Design', 'Eco-Friendly Materials'],
            capacityUtilization: 67.8
        }
    ])

    // Shipments Data
    const [shipments] = useState<Shipment[]>([
        {
            id: 'ship-001',
            type: 'inbound',
            status: 'in_transit',
            origin: 'MetalCorp Industries, Bucuresti',
            destination: 'FabricAI Main Warehouse',
            carrier: 'Transport Express SRL',
            trackingNumber: 'TE20250809001',
            scheduledPickup: '2025-08-09T08:00:00Z',
            actualPickup: '2025-08-09T08:15:00Z',
            estimatedDelivery: '2025-08-09T16:00:00Z',
            items: [
                { itemId: 'inv-001', quantity: 100, weight: 750, value: 4550 }
            ],
            totalWeight: 750,
            totalValue: 4550,
            shippingCost: 125,
            insurance: 50,
            onTimePerformance: true,
            damageReported: false
        },
        {
            id: 'ship-002',
            type: 'outbound',
            status: 'delivered',
            origin: 'FabricAI Finished Goods',
            destination: 'Client Distribution Center, Constanta',
            carrier: 'FastLogistics SA',
            trackingNumber: 'FL20250808045',
            scheduledPickup: '2025-08-08T10:00:00Z',
            actualPickup: '2025-08-08T10:30:00Z',
            estimatedDelivery: '2025-08-08T18:00:00Z',
            actualDelivery: '2025-08-08T17:45:00Z',
            items: [
                { itemId: 'inv-004', quantity: 50, weight: 125, value: 6287.50 }
            ],
            totalWeight: 125,
            totalValue: 6287.50,
            shippingCost: 85,
            insurance: 75,
            onTimePerformance: true,
            damageReported: false,
            customerSatisfaction: 4.8
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                setInventoryItems(prev => prev.map(item => {
                    if (item.status === 'in_stock' || item.status === 'low_stock') {
                        const stockChange = Math.floor((Math.random() - 0.7) * 5) // Slight consumption bias
                        const newStock = Math.max(0, item.currentStock + stockChange)
                        let newStatus: typeof item.status = item.status

                        if (newStock === 0) newStatus = 'out_of_stock'
                        else if (newStock <= item.reorderPoint) newStatus = 'low_stock'
                        else newStatus = 'in_stock'

                        return {
                            ...item,
                            currentStock: newStock,
                            status: newStatus,
                            totalValue: newStock * item.unitCost
                        }
                    }
                    return item
                }))
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [realTimeMode])

    // Navigation tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: BarChart4 },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'suppliers', label: 'Suppliers', icon: Building2 },
        { id: 'logistics', label: 'Logistics', icon: Truck },
        { id: 'orders', label: 'Orders', icon: Archive },
        { id: 'analytics', label: 'Analytics', icon: PieChart }
    ]

    // Get status color and icon
    const getStockStatusInfo = (status: string) => {
        switch (status) {
            case 'in_stock': return { color: 'text-green-500 bg-green-100', icon: CheckCircle2, label: 'In Stock' }
            case 'low_stock': return { color: 'text-yellow-500 bg-yellow-100', icon: AlertTriangle, label: 'Low Stock' }
            case 'out_of_stock': return { color: 'text-red-500 bg-red-100', icon: XCircle, label: 'Out of Stock' }
            case 'on_order': return { color: 'text-blue-500 bg-blue-100', icon: Clock, label: 'On Order' }
            case 'discontinued': return { color: 'text-gray-500 bg-gray-100', icon: Minus, label: 'Discontinued' }
            default: return { color: 'text-gray-500 bg-gray-100', icon: Circle, label: 'Unknown' }
        }
    }

    // Get risk level color
    const getRiskLevelColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'high': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    // Calculate summary metrics
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0)
    const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock').length
    const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length
    const averageSupplierRating = suppliers.length > 0
        ? suppliers.reduce((sum, sup) => sum + sup.rating, 0) / suppliers.length
        : 0
    const activeShipments = shipments.filter(ship => ship.status === 'in_transit').length

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Supply Chain Management
                            </h1>
                            <p className="text-gray-600 mt-2">Comprehensive inventory, supplier, and logistics control</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {realTimeMode ? 'Live Updates' : 'Static Data'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setRealTimeMode(!realTimeMode)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${realTimeMode ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 mb-6">
                    <div className="flex space-x-1 p-1">
                        {navigationTabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${selectedView === tab.id
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Overview View */}
                {selectedView === 'overview' && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Total Inventory Value</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">
                                            €{(totalInventoryValue / 1000).toFixed(0)}K
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {inventoryItems.length} items tracked
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Stock Alerts</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{lowStockItems + outOfStockItems}</p>
                                        <div className="flex items-center mt-1">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-red-600 ml-1">{outOfStockItems} critical</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Supplier Rating</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{averageSupplierRating.toFixed(1)}</p>
                                        <div className="flex items-center mt-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm text-gray-600 ml-1">{suppliers.length} suppliers</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Active Shipments</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{activeShipments}</p>
                                        <div className="flex items-center mt-1">
                                            <Navigation className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-blue-600 ml-1">In transit</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Truck className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supply Chain Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Inventory Status */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Inventory Items</h3>
                                <div className="space-y-3">
                                    {inventoryItems
                                        .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
                                        .slice(0, 5)
                                        .map((item, index) => {
                                            const statusInfo = getStockStatusInfo(item.status)
                                            const StatusIcon = statusInfo.icon
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            <span>{statusInfo.label}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Stock:</span>
                                                            <p className="font-semibold">{item.currentStock} {item.unit}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Reorder Point:</span>
                                                            <p className="font-semibold">{item.reorderPoint} {item.unit}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Lead Time:</span>
                                                            <p className="font-semibold">{item.leadTime} days</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%` }}
                                                            transition={{ duration: 1, delay: index * 0.2 }}
                                                            className={`h-2 rounded-full ${item.status === 'out_of_stock' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                                                    item.status === 'low_stock' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                        'bg-gradient-to-r from-green-400 to-green-600'
                                                                }`}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                </div>
                            </div>

                            {/* Supplier Performance */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h3>
                                <div className="space-y-4">
                                    {suppliers
                                        .sort((a, b) => b.rating - a.rating)
                                        .slice(0, 3)
                                        .map((supplier, index) => (
                                            <motion.div
                                                key={supplier.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(supplier.riskLevel)}`}>
                                                        <span>{supplier.riskLevel.charAt(0).toUpperCase() + supplier.riskLevel.slice(1)} Risk</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-3">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Rating</p>
                                                        <p className="font-semibold text-gray-900">{supplier.rating}/5</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">On-Time</p>
                                                        <p className="font-semibold text-gray-900">{supplier.onTimeDelivery}%</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Quality</p>
                                                        <p className="font-semibold text-gray-900">{supplier.qualityScore}%</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Orders:</span>
                                                    <span className="font-medium">{supplier.totalOrders}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other views placeholder */}
                {(['inventory', 'suppliers', 'logistics', 'orders', 'analytics'].includes(selectedView)) && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-200/50 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Module
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedView} management features will be implemented here.
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg inline-block">
                            Coming Soon: {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Management
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
