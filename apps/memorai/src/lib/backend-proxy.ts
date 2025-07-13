import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

// Base URL for the backend API
const BACKEND_URL = process.env['BACKEND_URL'] || 'http://localhost:3001';

/**
 * Helper function to create a proxy handler for API routes
 * This allows frontend to call backend without CORS issues
 *
 * @param endpoint The backend endpoint to proxy to (e.g. '/auth/login')
 * @returns A request handler function for Next.js API routes
 */
export function createBackendProxy(endpoint: string) {
  const handler = async function (request: NextRequest): Promise<NextResponse> {
    try {
      // Build the target URL
      const url = new URL(endpoint, BACKEND_URL);
      logger.info(`Proxying request to ${url.toString()}`);

      // Get the request method
      const method = request.method;

      // Clone headers from the incoming request, but exclude host
      const headers = new Headers();
      request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
          headers.append(key, value);
        }
      });

      // Forward auth cookies if present
      const cookies = request.cookies;
      if (cookies.has('authToken')) {
        headers.append(
          'Authorization',
          `Bearer ${cookies.get('authToken')?.value}`
        );
      }

      // Build the fetch options
      const fetchOptions: RequestInit = {
        method,
        headers,
        redirect: 'follow',
      };

      // Add body for non-GET requests
      if (method !== 'GET' && method !== 'HEAD') {
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          const body = await request.json();
          fetchOptions.body = JSON.stringify(body);
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          fetchOptions.body = formData;
        } else if (contentType?.includes('multipart/form-data')) {
          const formData = await request.formData();
          fetchOptions.body = formData;
        } else {
          fetchOptions.body = await request.text();
        }
      }

      // Make the request to the backend API
      let backendResponse;
      try {
        logger.info(`Fetch URL: ${url.toString()}`, {
          context: { fetchOptions },
        });
        backendResponse = await fetch(url.toString(), fetchOptions);
        logger.info(`Response status: ${backendResponse.status}`); // Get response data
        const responseData = await backendResponse.text();
        let parsedData: unknown = responseData;

        // Try to parse JSON if response is JSON
        try {
          if (
            backendResponse.headers
              .get('content-type')
              ?.includes('application/json')
          ) {
            parsedData = JSON.parse(responseData);
          }
        } catch (e) {
          logger.error('Failed to parse JSON response from backend', {
            context: {
              endpoint,
              error: e instanceof Error ? e.message : String(e),
            },
          });
        }

        // Create the response with the right status and data
        const response = NextResponse.json(parsedData, {
          status: backendResponse.status,
        });

        // Forward cookies from backend response
        backendResponse.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'set-cookie') {
            response.headers.append(key, value);
          }
        }); // Handle auth token if in response
        if (
          typeof parsedData === 'object' &&
          parsedData !== null &&
          'token' in parsedData &&
          typeof (parsedData as { token?: string }).token === 'string' &&
          backendResponse.ok
        ) {
          const authResponse = parsedData as { token: string };
          // Set the auth token cookie
          response.cookies.set({
            name: 'authToken',
            value: authResponse.token,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          });
        }

        return response;
      } catch (error) {
        logger.error('Backend connection error', {
          context: {
            endpoint,
            error: error instanceof Error ? error.message : String(error),
            url: url.toString(),
          },
        });

        return NextResponse.json(
          {
            error: 'Failed to connect to backend service',
            message: 'There was an error connecting to the backend service',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      logger.error('Backend proxy error', {
        context: {
          endpoint,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      // Return a generic error response
      return NextResponse.json(
        {
          error: 'Backend proxy error',
          message: 'An error occurred in the backend proxy',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
    PATCH: handler,
  };
}
