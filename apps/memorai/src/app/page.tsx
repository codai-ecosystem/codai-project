// Temporarily simplified for testing
// import MemoraiSSODemo from '../components/MemoraiSSODemo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MEMORAI</h1>
        <p className="text-gray-300 mb-8">AI Memory & Database Core - Enterprise</p>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-sm text-gray-400 mb-4">Server Status: ✅ Running</p>
          <p className="text-sm text-blue-300">SSO integration loading...</p>
        </div>
      </div>
    </div>
  );
}
