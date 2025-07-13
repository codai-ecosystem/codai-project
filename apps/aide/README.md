# AIDE - AI Development Environment

AIDE is a revolutionary chat-driven development interface that transforms how developers interact with code. Built with Next.js 15, React 19, and modern web technologies, AIDE provides a VS Code-like experience with AI-powered chat integration.

## 🌟 Features

### Phase 1: Chat-Driven Interface ✅
- **Real-time Chat**: Instant AI-powered conversations about your code
- **Project Sidebar**: Organize and switch between multiple projects
- **Glassmorphism UI**: Modern, beautiful interface with subtle animations
- **Responsive Design**: Works seamlessly across all devices

### Phase 2: VS Code Integration ✅
- **File Explorer**: Full file tree with Git status indicators
- **Code Editor**: VS Code-like editor with syntax highlighting
- **Tabbed Interface**: Multiple file editing with tab management
- **Integrated Terminal**: Built-in terminal for command execution
- **Status Bar**: Real-time project status and information

### Phase 3: Advanced AI Features (Coming Soon)
- **Real File Operations**: Direct file system manipulation
- **AI Code Generation**: Intelligent code suggestions and generation
- **Live Collaboration**: Real-time multi-user editing
- **Advanced Debugging**: Integrated debugging tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd codai-project

# Install dependencies
pnpm install

# Start AIDE
node launch-aide.js
```

### Individual App Launch
```bash
# Start AIDE specifically on port 4042
cd apps/aide
pnpm dev --port 4042
```

## 🏗️ Architecture

AIDE is built on a modern technology stack:

- **Next.js 15**: App router with React 19 for cutting-edge performance
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom glassmorphism components
- **Framer Motion**: Smooth animations and transitions
- **Zustand**: Lightweight state management
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful, consistent icons

## 📱 User Interface

### Main Components

1. **Project Sidebar**: 
   - Project selection and management
   - Quick project switching
   - Project creation tools

2. **File Explorer**:
   - Real-time file tree
   - Git integration with status indicators
   - Context menu operations (create, delete, rename)
   - File search functionality

3. **Code Editor**:
   - VS Code-like editing experience
   - Tabbed interface for multiple files
   - Syntax highlighting
   - Line numbers and minimap
   - Find and replace functionality
   - Keyboard shortcuts

4. **Chat Interface**:
   - AI-powered conversations
   - Context-aware responses
   - Chat history management
   - Conversation management

5. **Integrated Terminal**:
   - Multiple terminal sessions
   - Command history
   - Tab completion
   - Working directory management

6. **Status Bar**:
   - Real-time project status
   - Toggle controls for components
   - System information

## 🎯 Usage

### Chat-Driven Development
1. Open AIDE in your browser (http://localhost:3000)
2. Select or create a project in the sidebar
3. Start a conversation about your development needs
4. Watch as AIDE helps you navigate, edit, and understand your code

### File Management
- **Navigate**: Use the file explorer to browse your project
- **Edit**: Click on files to open them in the code editor
- **Search**: Use the search functionality to find files quickly
- **Git**: See real-time Git status for all files

### Terminal Operations
- **Open Terminal**: Click the Terminal button in the status bar
- **Multiple Sessions**: Create multiple terminal tabs for different tasks
- **Command History**: Use arrow keys to navigate command history
- **Tab Completion**: Press Tab for command completion

## 🔧 Development

### Project Structure
```
apps/aide/
├── components/          # React components
│   ├── AideDashboard.tsx   # Main dashboard component
│   ├── FileExplorer.tsx    # File tree component
│   ├── CodeEditor.tsx      # Code editing component
│   └── TerminalComponent.tsx # Terminal component
├── pages/              # Next.js pages
├── styles/             # Global styles
└── public/             # Static assets
```

### Key Components

- **AideDashboard**: Main orchestration component
- **FileExplorer**: File system navigation with Git integration
- **CodeEditor**: VS Code-like editing experience
- **TerminalComponent**: Integrated terminal functionality
- **ChatInterface**: AI conversation management

### Customization

AIDE is highly customizable:

1. **Themes**: Modify the glassmorphism theme in Tailwind config
2. **AI Integration**: Swap out the AI backend for your preferred service
3. **File Operations**: Enhance file operations with real system integration
4. **Terminal Commands**: Extend terminal functionality with custom commands

## 🌈 Visual Design

AIDE features a stunning glassmorphism design with:
- **Gradient Backgrounds**: Dynamic color gradients
- **Frosted Glass Effects**: Subtle backdrop blur
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Adapts to any screen size
- **Dark Theme**: Easy on the eyes for long coding sessions

---

**AIDE - Where AI meets Development**
*Transforming code interaction through intelligent conversation*
