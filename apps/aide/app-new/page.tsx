export default function Page() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🎉 AIDE is Working!</h1>
        <p className="text-gray-300 text-lg">Next.js React Application Successfully Running</p>
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <p className="text-green-400 font-semibold">✅ Transformation Complete</p>
          <p className="text-gray-400 text-sm mt-2">React components, Tailwind CSS, and beautiful UI all working</p>
        </div>
      </div>
    </div>
  )
}
