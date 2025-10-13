const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGN_UP: '/auth/signup',
    CONFIRM_EMAIL: '/auth/confirm-email',
    USER: '/auth/user',
  }
}

export const publicEndpoints = [ENDPOINTS.AUTH.LOGIN, ENDPOINTS.AUTH.SIGN_UP]
export default ENDPOINTS