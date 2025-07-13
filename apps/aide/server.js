const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4041;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for demo purposes
let projects = [
  { 
    id: 1, 
    name: 'Todo App', 
    description: 'A simple todo application with React',
    status: 'completed',
    language: 'JavaScript',
    framework: 'React',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'Chat Bot', 
    description: 'AI-powered customer service chatbot',
    status: 'in-progress',
    language: 'Python',
    framework: 'FastAPI',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
];

let conversations = [
  {
    id: 1,
    projectId: 1,
    messages: [
      { role: 'user', content: 'Create a todo app with React', timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'I\'ll create a React todo app for you. Let me start with the component structure...', timestamp: new Date().toISOString() }
    ]
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AIDE',
    description: 'AI Development Environment',
    port: PORT,
    type: 'development',
    category: 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    name: 'AIDE',
    status: 'operational',
    version: '1.0.0',
    framework: 'express',
    environment: 'development',
    port: PORT,
    compliance: 'port-4000-plus-policy',
    features: [
      'Chat-driven development',
      'Multi-language support',
      'GitHub integration',
      'Real-time code generation'
    ],
    stats: {
      totalProjects: projects.length,
      activeConversations: conversations.length,
      supportedLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
      uptime: Math.floor(process.uptime())
    }
  });
});

// Main service endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints
app.get('/api', (req, res) => {
  res.json({
    service: 'AIDE',
    version: '1.0.0',
    endpoints: [
      'GET /',
      'GET /health',
      'GET /status',
      'GET /api',
      'GET /api/projects',
      'GET /api/projects/:id',
      'POST /api/projects',
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id',
      'GET /api/projects/:id/conversations',
      'POST /api/chat',
      'POST /api/generate-code'
    ],
    documentation: 'https://docs.codai.ro/AIDE'
  });
});

// Get all projects
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: projects,
    count: projects.length
  });
});

// Get specific project
app.get('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  
  res.json({
    success: true,
    data: project
  });
});

// Create new project
app.post('/api/projects', (req, res) => {
  const { name, description, language, framework } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({
      success: false,
      error: 'Name and description are required'
    });
  }
  
  const newProject = {
    id: projects.length + 1,
    name,
    description,
    status: 'created',
    language: language || 'JavaScript',
    framework: framework || '',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  projects.push(newProject);
  
  res.status(201).json({
    success: true,
    data: newProject
  });
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  
  const updatedProject = {
    ...projects[projectIndex],
    ...req.body,
    lastModified: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  
  res.json({
    success: true,
    data: updatedProject
  });
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  
  projects.splice(projectIndex, 1);
  
  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// Get conversations for a project
app.get('/api/projects/:id/conversations', (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectConversations = conversations.filter(c => c.projectId === projectId);
  
  res.json({
    success: true,
    data: projectConversations
  });
});

// Chat with AI assistant
app.post('/api/chat', (req, res) => {
  const { message, projectId } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    });
  }
  
  // Simulate AI response (in a real implementation, this would call an AI service)
  const aiResponse = generateAIResponse(message);
  
  const conversation = {
    id: conversations.length + 1,
    projectId: projectId || null,
    messages: [
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ]
  };
  
  conversations.push(conversation);
  
  res.json({
    success: true,
    data: {
      response: aiResponse,
      conversationId: conversation.id
    }
  });
});

// Generate code endpoint
app.post('/api/generate-code', (req, res) => {
  const { prompt, language, framework } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }
  
  // Simulate code generation
  const generatedCode = generateCode(prompt, language, framework);
  
  res.json({
    success: true,
    data: {
      code: generatedCode,
      language: language || 'javascript',
      framework: framework || '',
      explanation: `Generated ${language || 'JavaScript'} code based on your prompt: "${prompt}"`
    }
  });
});

// Helper function to generate AI responses
function generateAIResponse(message) {
  const responses = [
    "I'll help you build that! Let me start by creating the basic structure...",
    "Great idea! I can implement that for you. Here's what I'm thinking...",
    "Perfect! I'll generate the code for that functionality. Let me break it down...",
    "That's an interesting project! I'll create a clean, modern implementation...",
    "I understand what you're looking for. Let me code that up for you..."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper function to generate code
function generateCode(prompt, language = 'javascript', framework = '') {
  const codeTemplates = {
    javascript: {
      react: `import React, { useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  
  // Generated based on: ${prompt}
  
  return (
    <div className="app">
      <h1>Generated App</h1>
      {/* Your implementation here */}
    </div>
  );
}

export default App;`,
      default: `// Generated JavaScript code for: ${prompt}

function main() {
  console.log('Hello from generated code!');
  
  // Your implementation here
}

main();`
    },
    python: `# Generated Python code for: ${prompt}

def main():
    print("Hello from generated code!")
    
    # Your implementation here

if __name__ == "__main__":
    main()`,
    typescript: `// Generated TypeScript code for: ${prompt}

interface AppProps {
  // Define your props here
}

function main(): void {
  console.log('Hello from generated TypeScript!');
  
  // Your implementation here
}

main();`
  };
  
  const langCode = codeTemplates[language.toLowerCase()];
  if (langCode && typeof langCode === 'object') {
    return langCode[framework.toLowerCase()] || langCode.default;
  }
  
  return codeTemplates[language.toLowerCase()] || codeTemplates.javascript.default;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AIDE service running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down AIDE service...');
  process.exit(0);
});