import { describe, expect, it, vi } from 'vitest';

import { errorHandler } from '../../src/lib/error-handler';

const ERROR_MESSAGE = 'Something went wrong';
const LOG_MESSAGE = 'Starting new test with real services';

interface MockReply {
  code: (status: number) => MockReply;
  send: (payload: unknown) => MockReply;
}

describe('Error Handler (Real Services)', () => {
  it('should handle validation errors correctly', () => {
    console.log(LOG_MESSAGE);

    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as MockReply;

    const validationError = {
      validation: [
        {
          path: '/body/email',
          message: 'Invalid email format',
        },
      ],
      validationContext: 'body',
    };

    errorHandler(validationError as never, {} as never, mockReply as never);
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Validation Error',
      message: 'The request data failed validation',
      statusCode: 400,
      details: [
        {
          path: '/body/email',
          message: 'Invalid email format',
        },
      ],
    });
  });

  it('should handle generic errors with 500 status', () => {
    console.log(LOG_MESSAGE);

    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as MockReply;

    const genericError = new Error(ERROR_MESSAGE);

    errorHandler(genericError, {} as never, mockReply as never);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Error',
        message: ERROR_MESSAGE,
        statusCode: 500,
        details: expect.objectContaining({
          stack: expect.any(Array),
        }),
      })
    );
  });

  it('should handle errors with statusCode property', () => {
    console.log(LOG_MESSAGE);

    const mockReply: MockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    const customError = {
      statusCode: 404,
      message: 'Not Found',
    };

    errorHandler(customError as never, {} as never, mockReply as never);
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Error',
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('should handle errors without message gracefully', () => {
    console.log(LOG_MESSAGE);

    const mockReply: MockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    const unknownError = { statusCode: 422 };

    errorHandler(unknownError as never, {} as never, mockReply as never);
    expect(mockReply.code).toHaveBeenCalledWith(422);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Error',
      message: undefined,
      statusCode: 422,
    });
  });
});
