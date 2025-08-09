import { API_BASE_URL } from '@/config/serverApiConfig';
import axios from 'axios';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';

axios.defaults.withCredentials = true;

const sendAuthRequest = async (method, endpoint, data = null, successOptions) => {
  try {
    const response = await axios({ method, url: API_BASE_URL + endpoint, data });
    const { status, data: resData } = response;

    successHandler({ data: resData, status }, successOptions);
    return resData;
  } catch (error) {
    return errorHandler(error);
  }
};

export const login = ({ loginData }) =>
  sendAuthRequest(
    'post',
    `login?timestamp=${Date.now()}`,
    loginData,
    { notifyOnSuccess: false, notifyOnFailed: true }
  );

export const register = ({ registerData }) =>
  sendAuthRequest(
    'post',
    'register',
    registerData,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

export const verify = ({ userId, emailToken }) =>
  sendAuthRequest(
    'get',
    `verify/${userId}/${emailToken}`,
    null,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

export const resetPassword = ({ resetPasswordData }) =>
  sendAuthRequest(
    'post',
    'resetpassword',
    resetPasswordData,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

export const logout = () =>
  sendAuthRequest(
    'post',
    `logout?timestamp=${Date.now()}`,
    null,
    { notifyOnSuccess: false, notifyOnFailed: true }
  );
