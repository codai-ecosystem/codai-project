// Mock useAuthState hook for testing
export const useAuthState = jest.fn().mockReturnValue([
  null, // user (null by default, tests should override this as needed)
  false, // loading
  undefined, // error
]);

// Other auth hooks can be added here as needed
export const useCreateUserWithEmailAndPassword = jest.fn();
export const useSignInWithEmailAndPassword = jest.fn();
export const useSignInWithGoogle = jest.fn();
export const useSignOut = jest
  .fn()
  .mockReturnValue([jest.fn(), false, undefined]);
