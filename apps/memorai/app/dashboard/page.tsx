'use client'

// Temporary simplified dashboard page for production build
export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">MEMORAI Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Memories</h3>
          <p className="text-2xl font-bold text-blue-600">2,847</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Active Sessions</h3>
          <p className="text-2xl font-bold text-green-600">23</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Knowledge Base</h3>
          <p className="text-2xl font-bold text-purple-600">1,245</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Memory Score</h3>
          <p className="text-2xl font-bold text-orange-600">87%</p>
        </div>
      </div>
    </div>
  )
}
