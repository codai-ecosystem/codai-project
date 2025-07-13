export default function HealthCheck() {
    return (
        <div>
            <h1>Health Check</h1>
            <p>Dashboard is running!</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    );
}
