import Dashboard from '@/components/Dashboard';

export default function Home() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Classic Dashboard</h1>
					<p className="text-gray-600 mt-2">
						Traditional monitoring and management interface
					</p>
				</div>
				<Dashboard />
			</div>
		</div>
	);
}
