import AuthDashboard from '@/components/AuthDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AuthDashboard />
      </div>
    </div>
  );
}
