#!/usr/bin/env node

import 'dotenv/config';
import { RomaiApiServer } from '@codai/romai-api';

async function main(): Promise<void> {
  console.log('🚀 Starting ROMAI API Server...');

  try {
    const server = new RomaiApiServer();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Shutting down ROMAI API Server...');
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      console.log('\n⏹️  Shutting down ROMAI API Server (SIGTERM)...');
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    await server.start();
  } catch (error) {
    console.error('❌ Failed to start ROMAI API Server:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
