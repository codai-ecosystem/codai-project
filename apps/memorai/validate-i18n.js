// Simple i18n validation test
import { resources } from '../lib/i18n/comprehensive-translations';

console.log('Testing i18n translations...');

// Test English translations
console.log('English - Common Cancel:', resources.en.common.cancel);
console.log('English - Memories Title:', resources.en.memorai.memories.title);
console.log('English - Memories Create:', resources.en.memorai.memories.create);

// Test Romanian translations  
console.log('Romanian - Common Cancel:', resources.ro.common.cancel);
console.log('Romanian - Memories Title:', resources.ro.memorai.memories.title);
console.log('Romanian - Memories Create:', resources.ro.memorai.memories.create);

// Verify all expected keys exist
const expectedKeys = [
  'common.cancel',
  'common.save',
  'common.loading',
  'memorai.memories.title',
  'memorai.memories.create',
  'memorai.dashboard.title'
];

let allKeysExist = true;

expectedKeys.forEach(keyPath => {
  const keys = keyPath.split('.');
  let enValue = resources.en;
  let roValue = resources.ro;
  
  for (const key of keys) {
    enValue = enValue?.[key];
    roValue = roValue?.[key];
  }
  
  if (!enValue || !roValue) {
    console.error(`❌ Missing translation for key: ${keyPath}`);
    allKeysExist = false;
  } else {
    console.log(`✅ Key ${keyPath}: EN="${enValue}", RO="${roValue}"`);
  }
});

if (allKeysExist) {
  console.log('🎉 All i18n keys are properly configured!');
  process.exit(0);
} else {
  console.error('❌ Some i18n keys are missing');
  process.exit(1);
}