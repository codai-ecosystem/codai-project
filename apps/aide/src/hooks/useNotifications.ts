export function useNotifications() {
  return {
    toast: {
      success: (message: string) => console.log('Success:', message),
      error: (message: string) => console.log('Error:', message),
      warning: (message: string) => console.log('Warning:', message),
      info: (message: string) => console.log('Info:', message),
    },
    notify: {
      success: (title: string, message?: string) => console.log('Notify success:', title, message),
      error: (title: string, message?: string) => console.log('Notify error:', title, message),
      warning: (title: string, message?: string) => console.log('Notify warning:', title, message),
      info: (title: string, message?: string) => console.log('Notify info:', title, message),
    }
  };
}
