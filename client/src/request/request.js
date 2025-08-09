import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from './errorHandler';
import successHandler from './successHandler';
import storePersist from '@/redux/storePersist';

const includeToken = () => {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;

  const auth = storePersist.get('auth');
  if (auth) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
  }
};

// Generic axios wrapper
const sendRequest = async (method, url, data = null, config = {}, successOptions) => {
  try {
    includeToken();
    const response = await axios({ method, url, data, ...config });
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
      headers: { 'Content-Type': 'multipart/form-data' },
    }, { notifyOnSuccess: true, notifyOnFailed: true }),

  read: (p) =>
    sendRequest('get', `${p.entity}/read/${p.id}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

  update: (p) =>
    sendRequest('patch', `${p.entity}/update/${p.id}`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  updateAndUpload: (p) =>
    sendRequest('patch', `${p.entity}/update/${p.id}`, p.jsonData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, { notifyOnSuccess: true, notifyOnFailed: true }),

  delete: (p) =>
    sendRequest('delete', `${p.entity}/delete/${p.id}`, null, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  filter: (p) => {
    const query = buildQuery({
      ...(p.options.filter && { filter: p.options.filter }),
      ...(p.options.equal && { equal: p.options.equal }),
    });
    return sendRequest('get', `${p.entity}/filter?${query}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false });
  },

  search: (p) =>
    sendRequest('get', `${p.entity}/search?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  list: (p) =>
    sendRequest('get', `${p.entity}/list?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  listAll: (p) =>
    sendRequest('get', `${p.entity}/listAll?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  post: (p) => sendRequest('post', p.entity, p.jsonData),

  get: (p) => sendRequest('get', p.entity),

  patch: (p) =>
    sendRequest('patch', p.entity, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  upload: (p) =>
    sendRequest('patch', `${p.entity}/upload/${p.id}`, p.jsonData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, { notifyOnSuccess: true, notifyOnFailed: true }),

  source: () => axios.CancelToken.source(),

  summary: (p) =>
    sendRequest('get', `${p.entity}/summary?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  mail: (p) =>
    sendRequest('post', `${p.entity}/mail/`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  convert: (p) =>
    sendRequest('get', `${p.entity}/convert/${p.id}`, null, {}, { notifyOnSuccess: true, notifyOnFailed: true }),
};

export default request;
