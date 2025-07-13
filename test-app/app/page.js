export default function HomePage() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>🎉 Codai Test Deployment Success!</h1>
            <p>This deployment is working correctly.</p>
            <p>Current time: {new Date().toISOString()}</p>
        </div>
    );
}
