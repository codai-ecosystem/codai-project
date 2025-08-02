declare namespace Express {
  interface Request {
    responseBuilder: {
      success: (data: any) => any;
      error: (message: string, code?: number) => any;
      validation: (errors: any) => any;
    };
  }
}
