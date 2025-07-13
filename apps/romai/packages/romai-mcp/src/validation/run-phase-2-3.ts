/**
 * Phase 2.3 Validation Runner
 */

import { validatePhase23 } from './validate-phase-2-3.js';

validatePhase23()
  .then(summary => {
    process.exit(summary.overallStatus === 'failure' ? 1 : 0);
  })
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
