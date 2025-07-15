// Simple test to validate AdvancedMemorySearch export
import { AdvancedMemorySearch } from '../lib/search/AdvancedMemorySearch'

console.log('Testing AdvancedMemorySearch...')
try {
  const search = new AdvancedMemorySearch()
  console.log('✅ Successfully created AdvancedMemorySearch instance')
  console.log('Type:', typeof search)
  console.log('Constructor:', search.constructor.name)
  console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(search)))
} catch (error) {
  console.error('❌ Failed to create AdvancedMemorySearch:', error)
}
