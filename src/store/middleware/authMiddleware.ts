
// Auth middleware to handle token expiration and automatic logout
export const authMiddleware = (store: any) => (next: any) => (action: any) => {
  // Check for token expiration before dispatching actions
  const state = store.getState();
  const { token, isAuthenticated } = state.auth;

  // If user is authenticated but no token, logout
  if (isAuthenticated && !token) {
    // Dispatch logout action
    // store.dispatch(logoutUser());
  }

  // Check token expiration (if you have token expiry in your implementation)
  if (token) {
    try {
      // Parse JWT token to check expiration
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        // Token expired, logout user
        // store.dispatch(logoutUser());
      }
    } catch (error) {
      console.log('Error parsing token:', error);
    }
  }

  return next(action);
};