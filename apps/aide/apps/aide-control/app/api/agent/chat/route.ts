import { NextRequest, NextResponse } from 'next/server';
import { AgentRuntimeService } from '../../../../lib/services/agent-runtime-service';
import { MemoryGraphEngine } from '../../../../lib/mock-memory-graph';
import { verifyAuth } from '../../../../lib/auth-middleware';

interface ChatRequest {
	message: string;
	projectId?: string;
	context?: Array<{
		role: string;
		content: string;
		timestamp: Date;
	}>;
}

export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const user = await verifyAuth(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { message, projectId, context }: ChatRequest = await request.json();

		if (!message?.trim()) {
			return NextResponse.json({ error: 'Message is required' }, { status: 400 });
		}
		// Initialize services
		const agentService = AgentRuntimeService.getInstance();
		const memoryGraph = new MemoryGraphEngine();

		// Add user message to memory if we have a project
		if (projectId) {
			await memoryGraph.addNode({
				id: `user-msg-${Date.now()}`,
				type: 'user-message',
				data: { message, userId: user.uid, timestamp: new Date() }
			});
		}
		// Process the message and generate response
		const responseData = await analyzeAndEnhanceResponse(message, projectId || '');

		// Add agent response to memory
		if (projectId) {
			await memoryGraph.addNode({
				id: `agent-response-${Date.now()}`,
				type: 'agent-response',
				data: { response: responseData.response, timestamp: new Date() }
			});
			if (responseData.metadata?.type === 'code') {
				await memoryGraph.addNode({
					id: `generated-code-${Date.now()}`,
					type: 'generated-code',
					data: { filename: responseData.metadata.filename, timestamp: new Date() }
				});
			}
		}

		return NextResponse.json(responseData);

	} catch (error) {
		console.error('Agent chat error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

async function analyzeAndEnhanceResponse(userMessage: string, projectId: string) {
	const lowerMessage = userMessage.toLowerCase();

	// Check if user is asking for code generation
	if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('generate')) {
		if (lowerMessage.includes('todo') || lowerMessage.includes('task')) {
			return {
				response: `I'll create a todo application for you! Here's a React component with full functionality:

The component includes:
✅ Add new tasks
✅ Mark tasks as complete
✅ Delete tasks
✅ Local storage persistence
✅ Modern UI with Tailwind CSS

The code is ready to use - just save it as a .tsx file in your project!`,
				metadata: {
					type: 'code',
					language: 'typescript',
					filename: 'TodoApp.tsx'
				},
				code: `import React, { useState, useEffect } from 'react';

interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: Date;
}

export default function TodoApp() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [input, setInput] = useState('');

	// Load todos from localStorage on mount
	useEffect(() => {
		const savedTodos = localStorage.getItem('todos');
		if (savedTodos) {
			setTodos(JSON.parse(savedTodos).map((todo: any) => ({
				...todo,
				createdAt: new Date(todo.createdAt)
			})));
		}
	}, []);

	// Save todos to localStorage whenever todos change
	useEffect(() => {
		localStorage.setItem('todos', JSON.stringify(todos));
	}, [todos]);

	const addTodo = () => {
		if (input.trim()) {
			const newTodo: Todo = {
				id: Date.now().toString(),
				text: input.trim(),
				completed: false,
				createdAt: new Date()
			};
			setTodos([...todos, newTodo]);
			setInput('');
		}
	};

	const toggleTodo = (id: string) => {
		setTodos(todos.map(todo =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo
		));
	};

	const deleteTodo = (id: string) => {
		setTodos(todos.filter(todo => todo.id !== id));
	};

	const completedCount = todos.filter(todo => todo.completed).length;

	return (
		<div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Todo App
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{todos.length > 0 ? \`\${completedCount}/\${todos.length} completed\` : 'No tasks yet'}
				</p>
			</div>

			<div className="flex gap-2 mb-6">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={(e) => e.key === 'Enter' && addTodo()}
					placeholder="Add a new task..."
					className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={addTodo}
					disabled={!input.trim()}
					className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
				>
					Add
				</button>
			</div>

			{todos.length === 0 ? (
				<div className="text-center py-12 text-gray-500 dark:text-gray-400">
					<div className="text-4xl mb-4">📝</div>
					<p>No tasks yet. Add one above to get started!</p>
				</div>
			) : (
				<div className="space-y-2">
					{todos.map(todo => (
						<div
							key={todo.id}
							className={\`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors \${
								todo.completed ? 'opacity-75' : ''
							}\`}
						>
							<input
								type="checkbox"
								checked={todo.completed}
								onChange={() => toggleTodo(todo.id)}
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
							/>
							<span
								className={\`flex-1 \${
									todo.completed
										? 'line-through text-gray-500 dark:text-gray-400'
										: 'text-gray-900 dark:text-white'
								}\`}
							>
								{todo.text}
							</span>
							<button
								onClick={() => deleteTodo(todo.id)}
								className="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
								title="Delete task"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}`
			};
		}

		if (lowerMessage.includes('weather')) {
			return {
				response: `I'll create a weather app for you! This will be a modern React component with:

🌤️ Current weather display
📍 Location-based weather data
🌡️ Temperature and conditions
💨 Wind speed and humidity
📱 Responsive mobile design

The component uses the OpenWeatherMap API for real weather data.`,
				metadata: {
					type: 'code',
					language: 'typescript',
					filename: 'WeatherApp.tsx'
				},
				code: `import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Wind, Droplets, Eye, Sunrise, Sunset } from 'lucide-react';

interface WeatherData {
	location: string;
	temperature: number;
	description: string;
	icon: string;
	humidity: number;
	windSpeed: number;
	visibility: number;
	sunrise: string;
	sunset: string;
}

export default function WeatherApp() {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [location, setLocation] = useState('');

	const fetchWeather = async (city: string = 'London') => {
		setLoading(true);
		setError(null);

		try {
			// Note: Replace 'YOUR_API_KEY' with actual OpenWeatherMap API key
			const API_KEY = 'YOUR_API_KEY';
			const response = await fetch(
				\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}&units=metric\`
			);

			if (!response.ok) {
				throw new Error('Weather data not found');
			}

			const data = await response.json();

			setWeather({
				location: \`\${data.name}, \${data.sys.country}\`,
				temperature: Math.round(data.main.temp),
				description: data.weather[0].description,
				icon: data.weather[0].icon,
				humidity: data.main.humidity,
				windSpeed: data.wind.speed,
				visibility: data.visibility / 1000,
				sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				}),
				sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				})
			});
		} catch (err) {
			setError('Failed to fetch weather data. Please check the city name and try again.');
			console.error('Weather fetch error:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWeather();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (location.trim()) {
			fetchWeather(location);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-8 p-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl shadow-xl">
			<form onSubmit={handleSearch} className="mb-6">
				<div className="flex gap-2">
					<input
						type="text"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder="Enter city name..."
						className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
					/>
					<button
						type="submit"
						className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg transition-colors"
					>
						🔍
					</button>
				</div>
			</form>

			{loading && (
				<div className="text-center py-8">
					<div className="animate-spin text-4xl mb-4">🌤️</div>
					<p>Loading weather data...</p>
				</div>
			)}

			{error && (
				<div className="text-center py-8">
					<div className="text-4xl mb-4">⚠️</div>
					<p className="text-white/90">{error}</p>
				</div>
			)}

			{weather && !loading && (
				<div className="space-y-6">
					<div className="text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<MapPin className="w-4 h-4" />
							<h2 className="text-lg font-semibold">{weather.location}</h2>
						</div>
						<div className="flex items-center justify-center gap-4 mb-4">
							<img
								src={\`https://openweathermap.org/img/wn/\${weather.icon}@2x.png\`}
								alt={weather.description}
								className="w-16 h-16"
							/>
							<div>
								<div className="text-4xl font-bold">{weather.temperature}°C</div>
								<div className="text-white/80 capitalize">{weather.description}</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<Droplets className="w-4 h-4" />
								<span className="text-sm text-white/80">Humidity</span>
							</div>
							<div className="text-xl font-semibold">{weather.humidity}%</div>
						</div>

						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<Wind className="w-4 h-4" />
								<span className="text-sm text-white/80">Wind</span>
							</div>
							<div className="text-xl font-semibold">{weather.windSpeed} m/s</div>
						</div>

						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<Sunrise className="w-4 h-4" />
								<span className="text-sm text-white/80">Sunrise</span>
							</div>
							<div className="text-lg font-semibold">{weather.sunrise}</div>
						</div>

						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<Sunset className="w-4 h-4" />
								<span className="text-sm text-white/80">Sunset</span>
							</div>
							<div className="text-lg font-semibold">{weather.sunset}</div>
						</div>
					</div>

					<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
						<div className="flex items-center gap-2 mb-2">
							<Eye className="w-4 h-4" />
							<span className="text-sm text-white/80">Visibility</span>
						</div>
						<div className="text-xl font-semibold">{weather.visibility} km</div>
					</div>
				</div>
			)}
		</div>
	);
}`
			};
		}

		if (lowerMessage.includes('deploy') || lowerMessage.includes('publish')) {
			return {
				response: `I can help you deploy your application! Here are the available deployment options:

🌐 **Web Applications:**
• Vercel (recommended for Next.js)
• Netlify (great for static sites)
• AWS Amplify (full-stack apps)

📱 **Mobile Applications:**
• Expo Go (for React Native)
• App Store / Google Play (production)

🐳 **Containerized Deployments:**
• Docker containers
• Kubernetes clusters
• AWS ECS/Fargate

Which type of deployment would you like to set up?`,
				metadata: {
					type: 'deploy',
					options: ['vercel', 'netlify', 'expo', 'docker']
				}
			};
		}
	}
	// Default enhanced response
	return {
		response: `I understand you want to ${userMessage}. I can help you with:

🌐 **Web Development:** React, Next.js, Vue, Angular apps
📱 **Mobile Apps:** React Native, Flutter applications
🖥️ **Desktop Apps:** Electron, Tauri applications
🔧 **Backend Services:** APIs, databases, microservices
☁️ **Deployment:** Vercel, AWS, Docker, mobile app stores

What specific type of application would you like to build? Please describe the features you need!`,
		metadata: {
			type: 'general',
			capabilities: ['web', 'mobile', 'desktop', 'backend', 'deployment']
		}
	};
}
