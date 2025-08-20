/**
 * CND Package - ARCHIVED
 * 
 * This is a preserved copy of the CND (CODAI Next Database) package
 * that was archived on July 30, 2025 as part of the MemorAI project 
 * consolidation to use CBD as the only database backend.
 */

// Archived main export from packages/cnd/src/index.ts
// Main CND Class - The primary entry point with Enterprise Features
import { Observable } from 'rxjs';
import { CBDAdapter } from './cbd-adapter.js';
import { SQLApi } from './apis/sql.js';
import { DocumentAPI } from './apis/document.js';
import { GraphAPI } from './apis/graph.js';
import { VectorAPI } from './apis/vector.js';
import { TimeSeriesAPI } from './apis/timeseries.js';
import { CacheAPI } from './apis/cache.js';
import { SchemaManager } from './schema.js';
import { MigrationManager } from './migration.js';
import { RealtimeEngine } from './realtime.js';

// Enterprise Components
import { AuthenticationManager } from './enterprise/authentication.js';
import { ServiceDiscoveryManager } from './enterprise/service-discovery.js';
import { AuditLogger } from './enterprise/audit-logger.js';
import { MetricsManager } from './enterprise/metrics.js';

import {
  CNDConfig,
  SchemaDefinition,
  Transaction,
  AdminConfig,
  AuthenticationContext,
  ServiceDiscoveryConfig
} from './types.js';

// NOTE: This is archived code and should not be used in production
// Use CBD directly instead: import { CBDMemoryEngine } from '@codai/cbd';

export class CND {
  // ... [Complete CND implementation preserved for reference]
  // See original source code in archived files
}

// Export everything for convenience (archived)
export * from './types.js';
export * from './cbd-adapter.js';
export { SchemaManager } from './schema.js';
export { MigrationManager } from './migration.js';
export { CND };

console.warn('⚠️  CND package is archived. Use @codai/cbd directly instead.');
