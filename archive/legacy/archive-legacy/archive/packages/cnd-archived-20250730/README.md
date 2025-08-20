# CND Package - ARCHIVED

**Date Archived:** July 30, 2025  
**Reason:** Consolidating to use CBD (Codai Better Database) as the only database backend per project requirements.  
**Original Location:** `packages/cnd/`

## What was CND?

CND (CODAI Next Database) was a multi-paradigm database wrapper around CBD that provided:

- **Enterprise Features**: Authentication, authorization, audit logging
- **Multiple APIs**: SQL, Document, Graph, Vector, Time Series
- **Real-time Capabilities**: Live queries and subscriptions  
- **Service Discovery**: Microservice registration and discovery
- **Metrics & Monitoring**: Performance tracking and health checks
- **Admin UI Generation**: Automatic admin interface creation

## Why was it archived?

Per the MemorAI project requirements, we needed to:
1. Use CBD as the only database backend
2. Remove duplicate database implementations
3. Simplify the architecture
4. Eliminate confusion between CND and CBD

## Migration Path

All CND functionality should be replaced with direct CBD usage:

```typescript
// OLD - CND usage
import { CND } from '@codai/cnd';
const db = new CND(config);

// NEW - Direct CBD usage  
import { CBDMemoryEngine } from '@codai/cbd';
const engine = new CBDMemoryEngine(config);
```

## Preserved Files

This archive contains:
- Complete source code
- Package configuration
- Documentation
- Test files
- Example configurations

If any CND functionality is needed in the future, it can be extracted from this archive and reimplemented as CBD extensions.
