export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MEMORAI Test Page</h1>
        <p className="text-gray-300">This is a simple test page to verify the server is working.</p>
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm">Server Status: ✅ Running</p>
          <p className="text-sm">Next.js: ✅ Compiled</p>
          <p className="text-sm">Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}
