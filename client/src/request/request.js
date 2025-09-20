import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from './errorHandler';
import successHandler from './successHandler';

function getCsrfToken() {
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const [name, value] = part.trim().split('=');
    if (name === 'csrf-token') return decodeURIComponent(value || '');
  }
  return null;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

axiosInstance.interceptors.request.use((config) => {
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase());
  if (needsCsrf) {
    const token = getCsrfToken();
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isRefreshRequest = typeof originalRequest.url === 'string' && originalRequest.url.includes('users/refresh');
      if (isRefreshRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await axiosInstance.get('users/refresh-access-token');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const sendRequest = async (method, url, data = null, config = {}, successOptions) => {
  try {
    const response = await axiosInstance({ method, url, data, ...config });
    if (successOptions) successHandler(response, successOptions);
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

const buildQuery = (options = {}) =>
Object.entries(options).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

const request = {
  create: (p) =>
  sendRequest('post', `${p.entity}/create`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  createAndUpload: (p) =>
  sendRequest('post', `${p.entity}/create`, p.jsonData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }, { notifyOnSuccess: true, notifyOnFailed: true }),

  read: (p) =>
  sendRequest('get', `${p.entity}/read/${p.id}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

  update: (p) =>
  sendRequest('patch', `${p.entity}/update/${p.id}`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  updateAndUpload: (p) =>
  sendRequest('patch', `${p.entity}/update/${p.id}`, p.jsonData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }, { notifyOnSuccess: true, notifyOnFailed: true }),

  delete: (p) =>
  sendRequest('delete', `${p.entity}/delete/${p.id}`, null, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  filter: (p) => {
    const query = buildQuery({
      ...(p.options.filter && { filter: p.options.filter }),
      ...(p.options.equal && { equal: p.options.equal })
    });
    return sendRequest('get', `${p.entity}/filter?${query}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false });
  },

  search: (p) =>
  sendRequest('get', `${p.entity}/search?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  list: (p) =>
  sendRequest('get', `${p.entity}/list?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  listAll: (p) =>
  sendRequest('get', `${p.entity}/listAll?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  post: (p) => {
    const config = {};


    const isFileUpload = p.jsonData instanceof FormData;

    if (isFileUpload) {

      config.headers = {};
    }

    if (p.onUploadProgress) {
      config.onUploadProgress = p.onUploadProgress;
    }

    return sendRequest('post', p.entity, p.jsonData, config);
  },

  get: (p) => sendRequest('get', p.entity),

  patch: (p) =>
  sendRequest('patch', p.entity, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  upload: (p) =>
  sendRequest('patch', `${p.entity}/upload/${p.id}`, p.jsonData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }, { notifyOnSuccess: true, notifyOnFailed: true }),

  source: () => axios.CancelToken.source(),

  summary: (p) =>
  sendRequest('get', `${p.entity}/summary?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  mail: (p) =>
  sendRequest('post', `${p.entity}/mail/`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  convert: (p) =>
  sendRequest('get', `${p.entity}/convert/${p.id}`, null, {}, { notifyOnSuccess: true, notifyOnFailed: true })
};

export default request;