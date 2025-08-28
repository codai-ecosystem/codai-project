'use client';

export default function TestPage() {
    console.log('TestPage component rendering');

    return (
        <div>
            <h1>Simple Test Page</h1>
            <p>If you can see this and it responds to clicks, React is working.</p>
            <button onClick={() => alert('React is working!')}>
                Test React
            </button>
        </div>
    );
}