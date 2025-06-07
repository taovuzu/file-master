import { notifyError } from '@/utils/notify';
import codeMessage from './codeMessage';

const successHandler = (
response,
options = { notifyOnSuccess: false, notifyOnFailed: true }) =>
{
  const { data, status } = response || {};
  const message = data?.message || codeMessage[status] || '';

  if (data?.success) {
    if (options.notifyOnSuccess) {
      notifyError(message, 'success', 3);
    }
  } else {
    if (options.notifyOnFailed) {
      notifyError(message, 'error', 4);
    }
  }
};

export default successHandler;