import { message } from 'antd';

const activeKeys = new Map();

const show = (type, content, key = 'global', duration = 3) => {
  const dedupeKey = `${type}:${key}`;
  
  if (activeKeys.has(dedupeKey)) {
    return;
  }

  message.open({ 
    type, 
    content, 
    key: dedupeKey, 
    duration,
    maxCount: 1
  });
  activeKeys.set(dedupeKey, Date.now());
  
  setTimeout(() => {
    activeKeys.delete(dedupeKey);
  }, duration * 1000);
};

export const notifySuccess = (content, key, duration) => show('success', content, key, duration);
export const notifyError = (content, key, duration) => show('error', content, key, duration);

export default {
  success: notifySuccess,
  error: notifyError
};