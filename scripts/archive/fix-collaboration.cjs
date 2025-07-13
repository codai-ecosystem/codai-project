#!/usr/bin/env node

/**
 * FIX COLLABORATION ROUTE
 * Remove non-existent fields from collaboration API
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 FIXING COLLABORATION ROUTE');

const filePath = 'apps/codai/src/app/api/workspace/collaboration/route.ts';

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix include user field
  content = content.replace(/include:\s*{\s*user:/g, 'select: {');
  
  // Fix permissions field
  content = content.replace(/permissions:\s*"admin",?/g, '// permissions removed');
  
  // Fix cursorPosition field
  content = content.replace(/cursorPosition:\s*validatedData\.cursorPosition[^,\n}]*/g, '// cursorPosition removed');
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed collaboration route');
} else {
  console.log('❌ File not found');
}

console.log('Done');
