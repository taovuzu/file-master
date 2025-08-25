import { notification } from 'antd';
import codeMessage from './codeMessage';

const notify = (type, title, description, duration = 15, maxCount = 1) => {
  notification.config({ duration, maxCount });
  notification[type]({ message: title, description });
};

const successHandler = (
response,
options = { notifyOnSuccess: false, notifyOnFailed: true }) =>
{
  const { data, status } = response || {};
  const message = data?.message || codeMessage[status] || '';

  console.log(data.success, data);
  if (data?.success) {
    if (options.notifyOnSuccess) {
      notify('success', 'Request success', message, 2);
    }
  } else {
    if (options.notifyOnFailed) {
      notify('error', `Request error ${status}`, message, 4);
    }
  }
};

export default successHandler;