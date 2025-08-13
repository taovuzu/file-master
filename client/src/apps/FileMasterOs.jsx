import { useLayoutEffect } from 'react';
import { useEffect } from 'react';
import { selectAllSettings } from '@/redux/settings/selectors';
import { useDispatch, useSelector } from 'react-redux';

import { Layout } from 'antd';

import { useAppContext } from '@/context/appContext';

import LoginForm from '@/forms/LoginForm'
import RegisterForm from '@/forms/RegisterForm';
import ForgetPasswordForm from '@/forms/ForgetPasswordForm';
import ResetPasswordForm from '@/forms/ResetPasswordForm';
import PageLoader from '@/components/PageLoader';

const FileMasterOs = () => {
  return (
    <>
    <ResetPasswordForm></ResetPasswordForm>
    </>
  )
};

export default FileMasterOs;