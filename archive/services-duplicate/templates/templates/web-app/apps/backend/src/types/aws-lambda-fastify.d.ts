/**
 * Type definitions for aws-lambda-fastify
 */
declare module 'aws-lambda-fastify' {
  import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
  import type { FastifyInstance } from 'fastify';

  /**
   * Options for the aws-lambda-fastify adapter
   */
  interface AwsLambdaFastifyOptions {
    /**
     * Whether to prefix the route with the API Gateway stage
     */
    decorateRequest?: boolean;
  }

  /**
   * Create a Lambda handler function from a Fastify instance
   * @param app - The Fastify instance
   * @param options - Configuration options
   * @returns A Lambda handler function
   */
  export default function awsLambdaFastify(
    app: FastifyInstance,
    options?: AwsLambdaFastifyOptions
  ): (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;
}
