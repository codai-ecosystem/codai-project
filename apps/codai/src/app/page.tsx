import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Codai Central Platform</h1>
        <p className="text-xl text-muted-foreground">AI-Driven Ecosystem Orchestration & Management Hub</p>
      </div>
      <Dashboard />
    </div>
  )
}