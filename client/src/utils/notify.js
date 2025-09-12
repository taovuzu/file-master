import { message } from 'antd';

const activeKeys = new Map();

const show = (type, content, key = 'global', duration = 2) => {
  const dedupeKey = `${type}:${key}`;

  message.open({ type, content, key: dedupeKey, duration });
  activeKeys.set(dedupeKey, Date.now());
};

export const notifySuccess = (content, key, duration) => show('success', content, key, duration);
export const notifyError = (content, key, duration) => show('error', content, key, duration);
export const notifyInfo = (content, key, duration) => show('info', content, key, duration);
export const notifyWarning = (content, key, duration) => show('warning', content, key, duration);

export default {
  success: notifySuccess,
  error: notifyError,
  info: notifyInfo,
  warning: notifyWarning
};