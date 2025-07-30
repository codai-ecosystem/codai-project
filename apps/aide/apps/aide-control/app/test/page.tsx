export default function TestPage() {
	return (
		<div>
			<h1>Test Page</h1>
			<p>If you can see this, the basic Next.js functionality is working.</p>
			<p>Environment: {process.env.NODE_ENV}</p>
			<p>Demo Mode: {process.env.NEXT_PUBLIC_DEMO_MODE}</p>
		</div>
	);
}
