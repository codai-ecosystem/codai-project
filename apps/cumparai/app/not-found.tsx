export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
        <p className="text-gray-400 mb-8">Could not find the requested resource.</p>
        <a
          href="/"
          className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all font-medium"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
