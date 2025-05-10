const rawBackend = import.meta.env.VITE_BACKEND_SERVER || '';
const ensureTrailingSlash = (url) => (url.endsWith('/') ? url : url + '/');

export const BASE_URL = rawBackend ? ensureTrailingSlash(rawBackend) : '';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/v1/';

export const DOWNLOAD_BASE_URL =
  import.meta.env.VITE_DOWNLOAD_BASE_URL || `${API_BASE_URL}download/`;

export const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL || (import.meta.env.DEV ? '/' : '/');

export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL =
  import.meta.env.VITE_FILE_BASE_URL || (BASE_URL || '/');