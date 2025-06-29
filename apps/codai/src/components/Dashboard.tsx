'use client';

import { useState, useEffect } from 'react';
import { StatCard, ServiceCard, Badge, Progress } from '@codai/ui';
import { MessageCircle, Code, BarChart3 } from 'lucide-react';
import AideInterface from './AideInterface';

interface ServiceStatus {
	name: string;
	status: 'online' | 'offline' | 'error' | 'maintenance';
	uptime: string;
	requests: number;
	domain: string;
	tier: 'foundation' | 'business' | 'specialized';
	responseTime?: number;
	lastUpdate?: string;
}

interface SystemMetrics {
	totalServices: number;
	activeUsers: number;
	totalRequests: number;
	systemHealth: number;
	cpuUsage: number;
	memoryUsage: number;
	networkLatency: number;
}

export default function Dashboard() {
	const [activeTab, setActiveTab] = useState<'dashboard' | 'aide'>('dashboard');
	const [services, setServices] = useState<ServiceStatus[]>([]);
	const [metrics, setMetrics] = useState<SystemMetrics>({
		totalServices: 0,
		activeUsers: 0,
		totalRequests: 0,
		systemHealth: 0,
		cpuUsage: 0,
		memoryUsage: 0,
		networkLatency: 0,
	});
	const [loading, setLoading] = useState(true);
	const [selectedTier, setSelectedTier] = useState<string>('all');

	useEffect(() => {
		// Simulate API call to get service statuses and metrics
		const fetchDashboardData = async () => {
			setLoading(true);

			// Mock data - in production this would come from your monitoring API
			const mockServices: ServiceStatus[] = [
				{
					name: 'Codai Platform',
					status: 'online',
					uptime: '99.9%',
					requests: 12543,
					domain: 'codai.ro',
					tier: 'foundation',
					responseTime: 45,
					lastUpdate: '2 minutes ago',
				},
				{
					name: 'Memorai',
					status: 'online',
					uptime: '99.8%',
					requests: 8934,
					domain: 'memorai.ro',
					tier: 'foundation',
					responseTime: 52,
					lastUpdate: '1 minute ago',
				},
				{
					name: 'Logai',
					status: 'online',
					uptime: '99.7%',
					requests: 15632,
					domain: 'logai.ro',
					tier: 'foundation',
					responseTime: 38,
					lastUpdate: '3 minutes ago',
				},
				{
					name: 'X API Gateway',
					status: 'online',
					uptime: '99.9%',
					requests: 25678,
					domain: 'x.codai.ro',
					tier: 'foundation',
					responseTime: 28,
					lastUpdate: '1 minute ago',
				},
				{
					name: 'Bancai',
					status: 'online',
					uptime: '99.5%',
					requests: 3421,
					domain: 'bancai.ro',
					tier: 'business',
					responseTime: 63,
					lastUpdate: '4 minutes ago',
				},
				{
					name: 'Wallet',
					status: 'online',
					uptime: '99.6%',
					requests: 5234,
					domain: 'wallet.codai.ro',
					tier: 'business',
					responseTime: 47,
					lastUpdate: '2 minutes ago',
				},
				{
					name: 'Fabricai',
					status: 'online',
					uptime: '99.4%',
					requests: 7865,
					domain: 'fabricai.ro',
					tier: 'specialized',
					responseTime: 71,
					lastUpdate: '5 minutes ago',
				},
				{
					name: 'Studiai',
					status: 'online',
					uptime: '99.3%',
					requests: 9876,
					domain: 'studiai.ro',
					tier: 'specialized',
					responseTime: 59,
					lastUpdate: '3 minutes ago',
				},
				{
					name: 'Sociai',
					status: 'online',
					uptime: '99.2%',
					requests: 6543,
					domain: 'sociai.ro',
					tier: 'specialized',
					responseTime: 84,
					lastUpdate: '6 minutes ago',
				},
				{
					name: 'Cumparai',
					status: 'online',
					uptime: '99.1%',
					requests: 4321,
					domain: 'cumparai.ro',
					tier: 'specialized',
					responseTime: 76,
					lastUpdate: '4 minutes ago',
				},
				{
					name: 'Publicai',
					status: 'online',
					uptime: '99.0%',
					requests: 2109,
					domain: 'publicai.ro',
					tier: 'specialized',
					responseTime: 92,
					lastUpdate: '7 minutes ago',
				},
			];

			const totalRequests = mockServices.reduce((sum, service) => sum + service.requests, 0);
			const averageUptime = mockServices.length > 0
				? mockServices.reduce((sum, service) => sum + parseFloat(service.uptime), 0) / mockServices.length
				: 0;

			const mockMetrics: SystemMetrics = {
				totalServices: mockServices.length,
				activeUsers: 2847,
				totalRequests: totalRequests,
				systemHealth: Math.round(averageUptime * 10) / 10,
				cpuUsage: Math.round(Math.random() * 40 + 30), // 30-70%
				memoryUsage: Math.round(Math.random() * 30 + 50), // 50-80%
				networkLatency: Math.round(Math.random() * 20 + 10), // 10-30ms
			};

			setServices(mockServices);
			setMetrics(mockMetrics);
			setLoading(false);
		};

		fetchDashboardData();

		// Set up real-time updates
		const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds

		return () => clearInterval(interval);
	}, []);

	const filteredServices = selectedTier === 'all'
		? services
		: services.filter(service => service.tier === selectedTier);

	const getServicesByTier = (tier: string) =>
		services.filter(service => service.tier === tier).length;

	const handleServiceManage = (serviceName: string) => {
		// Handle service management action
		console.log(`Managing service: ${serviceName}`);
		// In a real app, this would navigate to the service management page
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="relative">
					<div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-6 h-6 rounded-full bg-blue-600 animate-pulse"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
			{/* Header with Tabs */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Codai Development Platform
					</h1>
					<p className="text-gray-600">
						AI-powered development environment and ecosystem monitoring
					</p>
				</div>
				<div className="flex items-center space-x-3">
					<Badge variant="success" className="animate-pulse">
						Live
					</Badge>
					<span className="text-sm text-gray-500">
						Last updated: {new Date().toLocaleTimeString()}
					</span>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
				<button
					onClick={() => setActiveTab('dashboard')}
					className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard'
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-gray-600 hover:text-gray-900'
						}`}
				>
					<BarChart3 className="w-5 h-5" />
					<span>Dashboard</span>
				</button>
				<button
					onClick={() => setActiveTab('aide')}
					className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'aide'
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-gray-600 hover:text-gray-900'
						}`}
				>
					<Code className="w-5 h-5" />
					<span>AIDE</span>
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === 'dashboard' ? (
				<div className="space-y-8">
					{/* Dashboard Content */}

					{/* Key Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<StatCard
							title="Total Services"
							value={metrics.totalServices}
							subtitle="Across all tiers"
							variant="primary"
							trend={{ value: 8.2, positive: true, label: "vs last month" }}
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
									/>
								</svg>
							}
						/>

						<StatCard
							title="Active Users"
							value={metrics.activeUsers.toLocaleString()}
							subtitle="Real-time connections"
							variant="success"
							trend={{ value: 12.4, positive: true, label: "vs last month" }}
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
									/>
								</svg>
							}
						/>

						<StatCard
							title="Total Requests"
							value={metrics.totalRequests.toLocaleString()}
							subtitle="Last 24 hours"
							variant="default"
							trend={{ value: 5.8, positive: true, label: "vs yesterday" }}
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
									/>
								</svg>
							}
						/>

						<StatCard
							title="System Health"
							value={`${metrics.systemHealth}%`}
							subtitle="Average uptime"
							variant="success"
							trend={{ value: 0.3, positive: true, label: "vs last week" }}
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							}
						/>
					</div>

					{/* System Performance */}
					<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-gray-900 mb-6">System Performance</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-700">CPU Usage</span>
									<span className="text-sm text-gray-500">{metrics.cpuUsage}%</span>
								</div>
								<Progress
									value={metrics.cpuUsage}
									variant={metrics.cpuUsage > 80 ? 'error' : metrics.cpuUsage > 60 ? 'warning' : 'success'}
								/>
							</div>
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-700">Memory Usage</span>
									<span className="text-sm text-gray-500">{metrics.memoryUsage}%</span>
								</div>
								<Progress
									value={metrics.memoryUsage}
									variant={metrics.memoryUsage > 85 ? 'error' : metrics.memoryUsage > 70 ? 'warning' : 'success'}
								/>
							</div>
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-700">Network Latency</span>
									<span className="text-sm text-gray-500">{metrics.networkLatency}ms</span>
								</div>
								<Progress
									value={(30 - metrics.networkLatency) / 30 * 100}
									variant={metrics.networkLatency > 25 ? 'error' : metrics.networkLatency > 15 ? 'warning' : 'success'}
								/>
							</div>
						</div>
					</div>

					{/* Services Management */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
								<button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
									Refresh All
								</button>
							</div>

							{/* Filter Tabs */}
							<div className="flex flex-wrap gap-2">
								{[
									{ key: 'all', label: 'All Services', count: services.length },
									{ key: 'foundation', label: 'Foundation', count: getServicesByTier('foundation') },
									{ key: 'business', label: 'Business', count: getServicesByTier('business') },
									{ key: 'specialized', label: 'Specialized', count: getServicesByTier('specialized') },
								].map(({ key, label, count }) => (
									<button
										key={key}
										onClick={() => setSelectedTier(key)}
										className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${selectedTier === key
											? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
											: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
											}`}
									>
										{label}
										<Badge
											variant="secondary"
											className="ml-2 text-xs"
										>
											{count}
										</Badge>
									</button>
								))}
							</div>
						</div>

						{/* Service Grid */}
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredServices.map(service => (
									<ServiceCard
										key={service.name}
										name={service.name}
										status={service.status}
										uptime={service.uptime}
										requests={service.requests}
										domain={service.domain}
										tier={service.tier}
										onManage={() => handleServiceManage(service.name)}
									/>
								))}
							</div>

							{filteredServices.length === 0 && (
								<div className="text-center py-12">
									<svg
										className="w-12 h-12 text-gray-400 mx-auto mb-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
										/>
									</svg>
									<h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
									<p className="text-gray-500">
										No services match the selected tier filter.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			) : (
				<div className="h-[600px]">
					<AideInterface />
				</div>
			)}
		</div>
	);
}
