'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Mail, TrendingUp, Clock, Users, Eye, Reply, Archive,
    Calendar, Download, Filter, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';

interface AnalyticsData {
    emailsSent: number;
    emailsReceived: number;
    responseRate: number;
    avgResponseTime: number;
    unreadEmails: number;
    archivedEmails: number;
}

interface ChartData {
    name: string;
    sent: number;
    received: number;
    opened: number;
    replied: number;
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

export default function EmailAnalytics() {
    const [selectedPeriod, setSelectedPeriod] = useState('7days');
    const [selectedMetric, setSelectedMetric] = useState('all');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock analytics data
    const analyticsData: AnalyticsData = {
        emailsSent: 45,
        emailsReceived: 123,
        responseRate: 87.5,
        avgResponseTime: 2.4,
        unreadEmails: 12,
        archivedEmails: 89
    };

    const dailyEmailData: ChartData[] = [
        { name: 'Lun', sent: 8, received: 15, opened: 12, replied: 5 },
        { name: 'Mar', sent: 12, received: 22, opened: 18, replied: 8 },
        { name: 'Mie', sent: 6, received: 18, opened: 14, replied: 6 },
        { name: 'Joi', sent: 9, received: 25, opened: 20, replied: 9 },
        { name: 'Vin', sent: 15, received: 28, opened: 22, replied: 12 },
        { name: 'Sâm', sent: 3, received: 8, opened: 6, replied: 2 },
        { name: 'Dum', sent: 2, received: 7, opened: 5, replied: 1 }
    ];

    const categoryData: CategoryData[] = [
        { name: 'Muncă', value: 45, color: '#3B82F6' },
        { name: 'Personal', value: 25, color: '#10B981' },
        { name: 'Marketing', value: 20, color: '#8B5CF6' },
        { name: 'Notificări', value: 10, color: '#F59E0B' }
    ];

    const responseTimeData = [
        { name: 'Imediat (< 1h)', value: 15, color: '#10B981' },
        { name: 'Rapid (1-6h)', value: 35, color: '#3B82F6' },
        { name: 'Normal (6-24h)', value: 40, color: '#F59E0B' },
        { name: 'Întârziat (> 24h)', value: 10, color: '#EF4444' }
    ];

    const hourlyActivity = [
        { hour: '6', emails: 2 }, { hour: '7', emails: 5 }, { hour: '8', emails: 12 },
        { hour: '9', emails: 18 }, { hour: '10', emails: 25 }, { hour: '11', emails: 22 },
        { hour: '12', emails: 15 }, { hour: '13', emails: 10 }, { hour: '14', emails: 20 },
        { hour: '15', emails: 28 }, { hour: '16', emails: 24 }, { hour: '17', emails: 16 },
        { hour: '18', emails: 12 }, { hour: '19', emails: 8 }, { hour: '20', emails: 5 }
    ];

    const periods = [
        { id: '7days', name: 'Ultimele 7 zile' },
        { id: '30days', name: 'Ultimele 30 zile' },
        { id: '3months', name: 'Ultimele 3 luni' },
        { id: 'year', name: 'Anul acesta' }
    ];

    const metrics = [
        { id: 'all', name: 'Toate' },
        { id: 'sent', name: 'Trimise' },
        { id: 'received', name: 'Primite' },
        { id: 'engagement', name: 'Interacțiune' }
    ];

    const StatCard = ({ title, value, icon, change, color = 'blue' }: any) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
                    {change && (
                        <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>{change > 0 ? '+' : ''}{change}% vs săptămâna trecută</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">Analytics Email</h1>
                            <span className="text-sm text-gray-500">
                                Actualizat la {currentTime.toLocaleTimeString('ro-RO')}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {periods.map(period => (
                                    <option key={period.id} value={period.id}>{period.name}</option>
                                ))}
                            </select>
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {metrics.map(metric => (
                                    <option key={metric.id} value={metric.id}>{metric.name}</option>
                                ))}
                            </select>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <RefreshCw className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Emailuri Trimise"
                        value={analyticsData.emailsSent}
                        icon={<Mail className="h-6 w-6 text-blue-600" />}
                        change={12}
                        color="blue"
                    />
                    <StatCard
                        title="Emailuri Primite"
                        value={analyticsData.emailsReceived}
                        icon={<Mail className="h-6 w-6 text-green-600" />}
                        change={8}
                        color="green"
                    />
                    <StatCard
                        title="Rata de Răspuns"
                        value={`${analyticsData.responseRate}%`}
                        icon={<Reply className="h-6 w-6 text-purple-600" />}
                        change={-2}
                        color="purple"
                    />
                    <StatCard
                        title="Timp Mediu Răspuns"
                        value={`${analyticsData.avgResponseTime}h`}
                        icon={<Clock className="h-6 w-6 text-orange-600" />}
                        change={-15}
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Email Activity Chart */}
                    <div className="col-span-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Activitate Email Zilnică</h3>
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600">Trimise</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600">Primite</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span className="text-gray-600">Deschise</span>
                                    </div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyEmailData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sent" fill="#3B82F6" name="Trimise" />
                                    <Bar dataKey="received" fill="#10B981" name="Primite" />
                                    <Bar dataKey="opened" fill="#8B5CF6" name="Deschise" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuție pe Categorii</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Hourly Activity */}
                    <div className="col-span-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activitate pe Ore</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={hourlyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip labelFormatter={(value: any) => `${value}:00`} />
                                    <Area
                                        type="monotone"
                                        dataKey="emails"
                                        stroke="#3B82F6"
                                        fill="#3B82F6"
                                        fillOpacity={0.3}
                                        name="Emailuri"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Response Time Analysis */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Timp de Răspuns</h3>
                            <div className="space-y-4">
                                {responseTimeData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            ></div>
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{
                                                        width: `${item.value}%`,
                                                        backgroundColor: item.color
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="col-span-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Insights de Performanță</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-green-900">Rata de răspuns excelentă</h4>
                                        <p className="text-sm text-green-700 mt-1">
                                            Rata ta de răspuns de 87.5% este cu 15% mai mare decât media industriei.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900">Orele de vârf identificate</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Cele mai active ore sunt între 9-11 și 15-17. Programează emailurile importante în aceste intervale.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-orange-900">Emailuri neprocessate</h4>
                                        <p className="text-sm text-orange-700 mt-1">
                                            Ai 12 emailuri necitite. Consider să le procesezi pentru a menține o comunicare eficientă.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="col-span-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Acțiuni Rapide</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">Procesează emailuri necitite</span>
                                    </div>
                                    <div className="text-sm text-gray-500">{analyticsData.unreadEmails}</div>
                                </button>

                                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Archive className="h-5 w-5 text-purple-600" />
                                        <span className="text-sm font-medium text-gray-900">Revizuiește emailurile arhivate</span>
                                    </div>
                                    <div className="text-sm text-gray-500">{analyticsData.archivedEmails}</div>
                                </button>

                                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-gray-900">Programează email-uri</span>
                                    </div>
                                    <div className="text-sm text-gray-500">Nou</div>
                                </button>

                                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <span className="text-sm font-medium text-gray-900">Optimizează timpii de răspuns</span>
                                    </div>
                                    <div className="text-sm text-gray-500">Recomandat</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
