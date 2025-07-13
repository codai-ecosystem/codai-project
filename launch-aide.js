#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting AIDE - AI Development Environment...')

// Start the AIDE application on localhost:4042
const aide = spawn('pnpm', ['dev'], {
  cwd: path.join(__dirname, 'apps', 'aide'),
  stdio: 'inherit',
  shell: true
})

aide.on('error', (error) => {
  console.error('❌ Failed to start AIDE:', error)
  process.exit(1)
})

aide.on('exit', (code) => {
  console.log(`AIDE exited with code ${code}`)
  process.exit(code)
})

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AIDE...')
  aide.kill('SIGINT')
  process.exit(0)
})

console.log('✅ AIDE is starting...')
console.log('📝 Open http://localhost:3000 in your browser')
console.log('💬 Chat-driven development interface')
console.log('📁 VS Code-like file explorer')
console.log('⚡ Real-time code editing')
console.log('🖥️  Integrated terminal')
