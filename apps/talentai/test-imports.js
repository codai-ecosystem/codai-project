// Test imports individually
console.log('Testing imports...')

try {
  const framer = require('framer-motion')
  console.log('✓ framer-motion imports:', Object.keys(framer))
} catch (e) {
  console.log('✗ framer-motion error:', e.message)
}

try {
  const lucide = require('lucide-react')
  console.log('✓ lucide-react imports available')
} catch (e) {
  console.log('✗ lucide-react error:', e.message)
}

try {
  const react = require('react')
  console.log('✓ react imports:', Object.keys(react))
} catch (e) {
  console.log('✗ react error:', e.message)
}
