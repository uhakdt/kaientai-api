const env = process.env.ENVIRONMENT === 'Development';

// Urls
export const HostUrl = env ? process.env.HOST_URL_DEV : process.env.HOST_URL_PROD;
export const FrontendUrl = env ? process.env.KAIENTAI_DASHBOARD_FRONTEND_URL_DEV : process.env.KAIENTAI_DASHBOARD_FRONTEND_URL_PROD;
export const BackendUrl = env ? process.env.KAIENTAI_DASHBOARD_BACKEND_URL_DEV : process.env.KAIENTAI_DASHBOARD_BACKEND_URL_PROD;