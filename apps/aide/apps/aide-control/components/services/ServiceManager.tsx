'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useNotifications } from '../ui/Notifications'
import {
	ServerIcon,
	CodeBracketIcon,
	FireIcon,
	CpuChipIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ClockIcon,
	XCircleIcon,
	ShieldCheckIcon
} from '@heroicons/react/24/outline'

/**
 * Service Configuration Interface
 * Types for service management
 */
interface ServiceConfig {
	type: 'github' | 'firebase' | 'openai' | 'stripe';
	name: string;
	status: 'pending' | 'provisioning' | 'active' | 'failed' | 'suspended';
	config: any;
	createdAt: Date;
	lastUpdated: Date;
	error?: string;
}

interface GitHubRepoConfig {
	name: string;
	description: string;
	private: boolean;
	template?: string;
	autoInit: boolean;
	gitignoreTemplate?: string;
	licenseTemplate?: string;
}

interface FirebaseProjectConfig {
	projectId: string;
	displayName: string;
	features: {
		auth: boolean;
		firestore: boolean;
		storage: boolean;
		hosting: boolean;
		functions: boolean;
	};
	billing?: {
		plan: 'spark' | 'blaze';
		budget?: number;
	};
}

interface OpenAIProxyConfig {
	endpoint: string;
	models: string[];
	rateLimit: {
		requestsPerMinute: number;
		tokensPerMinute: number;
	};
	billing: {
		costMultiplier: number;
		passthrough: boolean;
	};
}

/**
 * Service Management Component
 * Provides UI for managing user services (GitHub, Firebase, OpenAI, etc.)
 */
export function ServiceManager() {
	const { user } = useAuth()
	const { addNotification } = useNotifications()
	const [services, setServices] = useState<ServiceConfig[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedService, setSelectedService] = useState<string | null>(null)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [createServiceType, setCreateServiceType] = useState<'github' | 'firebase' | 'openai'>('github')
	const [refreshing, setRefreshing] = useState(false)

	useEffect(() => {
		if (user?.uid) {
			loadServices()
		}
	}, [user])

	const loadServices = async () => {
		try {
			setLoading(true)

			const response = await fetch(`/api/services/configs?userId=${user?.uid}`)
			if (response.ok) {
				const data = await response.json()
				setServices(data.services || [])
			}
		} catch (error) {
			console.error('Failed to load services:', error)
			addNotification({
				type: 'error',
				title: 'Error',
				message: 'Failed to load services'
			})
		} finally {
			setLoading(false)
		}
	}

	const refreshServices = async () => {
		setRefreshing(true)
		await loadServices()
		setRefreshing(false)
	}

	const getServiceIcon = (type: string) => {
		switch (type) {
			case 'github':
				return <CodeBracketIcon className="h-6 w-6" />
			case 'firebase':
				return <FireIcon className="h-6 w-6" />
			case 'openai':
				return <CpuChipIcon className="h-6 w-6" />
			case 'stripe':
				return <ServerIcon className="h-6 w-6" />
			default:
				return <ServerIcon className="h-6 w-6" />
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return <CheckCircleIcon className="h-5 w-5 text-green-500" />
			case 'pending':
			case 'provisioning':
				return <ClockIcon className="h-5 w-5 text-yellow-500" />
			case 'failed':
				return <XCircleIcon className="h-5 w-5 text-red-500" />
			case 'suspended':
				return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
			default:
				return <ClockIcon className="h-5 w-5 text-gray-500" />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800'
			case 'pending':
			case 'provisioning':
				return 'bg-yellow-100 text-yellow-800'
			case 'failed':
				return 'bg-red-100 text-red-800'
			case 'suspended':
				return 'bg-orange-100 text-orange-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const createService = async (serviceType: string, config: any) => {
		try {
			const response = await fetch('/api/services/provision', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: user?.uid,
					serviceType,
					config
				})
			})

			if (response.ok) {
				addNotification({
					type: 'success',
					title: 'Service Created',
					message: `${serviceType} service provisioning started`
				})
				setShowCreateModal(false)
				loadServices()
			} else {
				throw new Error('Failed to create service')
			}
		} catch (error) {
			console.error('Failed to create service:', error)
			addNotification({
				type: 'error',
				title: 'Error',
				message: 'Failed to create service'
			})
		}
	}

	const deleteService = async (serviceId: string) => {
		if (!confirm('Are you sure you want to delete this service?')) return

		try {
			const response = await fetch(`/api/services/configs/${serviceId}`, {
				method: 'DELETE'
			})

			if (response.ok) {
				addNotification({
					type: 'success',
					title: 'Service Deleted',
					message: 'Service deleted successfully'
				})
				loadServices()
			} else {
				throw new Error('Failed to delete service')
			}
		} catch (error) {
			console.error('Failed to delete service:', error)
			addNotification({
				type: 'error',
				title: 'Error',
				message: 'Failed to delete service'
			})
		}
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date)
	}

	if (loading) {
		return (
			<div className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-gray-200 rounded w-1/4"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map(i => (
							<div key={i} className="h-32 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Service Management</h1>
					<p className="text-sm text-gray-600">Manage your provisioned services and integrations</p>
				</div>
				<div className="flex space-x-3">
					<button
						onClick={refreshServices}
						disabled={refreshing}
						className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
					>
						{refreshing ? 'Refreshing...' : 'Refresh'}
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
					>
						Add Service
					</button>
				</div>
			</div>

			{/* Service Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{services.map((service) => (
					<div key={`${service.type}-${service.name}`} className="bg-white p-6 rounded-lg shadow border">
						<div className="flex items-start justify-between">
							<div className="flex items-center space-x-3">
								<div className="text-indigo-600">
									{getServiceIcon(service.type)}
								</div>
								<div>
									<h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
									<p className="text-sm text-gray-500 capitalize">{service.type}</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{getStatusIcon(service.status)}
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
									{service.status}
								</span>
							</div>
						</div>

						<div className="mt-4 space-y-2">
							<div className="text-sm text-gray-600">
								<span className="font-medium">Created:</span> {formatDate(service.createdAt)}
							</div>
							<div className="text-sm text-gray-600">
								<span className="font-medium">Updated:</span> {formatDate(service.lastUpdated)}
							</div>
							{service.error && (
								<div className="text-sm text-red-600">
									<span className="font-medium">Error:</span> {service.error}
								</div>
							)}
						</div>

						<div className="mt-4 flex space-x-2">
							<button
								onClick={() => setSelectedService(`${service.type}-${service.name}`)}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							>
								Configure
							</button>
							<button
								onClick={() => deleteService(`${service.type}-${service.name}`)}
								className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
							>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>

			{services.length === 0 && (
				<div className="text-center py-12">
					<ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
					<p className="mt-1 text-sm text-gray-500">Get started by creating a new service.</p>
					<div className="mt-6">
						<button
							onClick={() => setShowCreateModal(true)}
							className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
						>
							Add Service
						</button>
					</div>
				</div>
			)}

			{/* Create Service Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>

						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
									Create New Service
								</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">Service Type</label>
										<select
											value={createServiceType}
											onChange={(e) => setCreateServiceType(e.target.value as any)}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										>
											<option value="github">GitHub Repository</option>
											<option value="firebase">Firebase Project</option>
											<option value="openai">OpenAI Proxy</option>
										</select>
									</div>

									{createServiceType === 'github' && (
										<div className="space-y-3">
											<input
												type="text"
												placeholder="Repository name"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<input
												type="text"
												placeholder="Description"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<label className="flex items-center">
												<input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
												<span className="ml-2 text-sm text-gray-700">Private repository</span>
											</label>
										</div>
									)}

									{createServiceType === 'firebase' && (
										<div className="space-y-3">
											<input
												type="text"
												placeholder="Project ID"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<input
												type="text"
												placeholder="Display name"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">Features</label>
												{['auth', 'firestore', 'storage', 'hosting', 'functions'].map(feature => (
													<label key={feature} className="flex items-center">
														<input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
														<span className="ml-2 text-sm text-gray-700 capitalize">{feature}</span>
													</label>
												))}
											</div>
										</div>
									)}

									{createServiceType === 'openai' && (
										<div className="space-y-3">
											<input
												type="text"
												placeholder="Endpoint URL"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<input
												type="number"
												placeholder="Requests per minute"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<input
												type="number"
												step="0.1"
												placeholder="Cost multiplier (e.g., 1.2)"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
										</div>
									)}
								</div>
							</div>

							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={() => createService(createServiceType, {})}
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Create Service
								</button>
								<button
									onClick={() => setShowCreateModal(false)}
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

