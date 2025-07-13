import awsLambdaFastify from 'aws-lambda-fastify';
import { fastify as Fastify } from 'fastify';

import { initApp } from './app';

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * Create the Fastify app for serverless functions
 */
const fastify = Fastify({
  logger: true,
  trustProxy: true,
});

// Initialize the app with all routes and plugins
initApp(fastify).catch(err => {
  console.error('Failed to initialize app:', err);
  process.exit(1);
});

// Create the serverless handler
const proxy = awsLambdaFastify(fastify);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return proxy(event, context);
};
