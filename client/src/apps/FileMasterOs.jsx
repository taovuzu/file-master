import { useLayoutEffect } from 'react';
import { useEffect } from 'react';
import { selectAllSettings } from '@/redux/settings/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';

import { useAppContext } from '@/context/appContext';
import AppRouter from '@/router/AppRouter';

const FileMasterOs = () => {
  const dispatch = useDispatch();
  const { appContextAction } = useAppContext();
  const settings = useSelector(selectAllSettings);

  useLayoutEffect(() => {
    // Initialize app settings and context
    if (settings) {
      // Apply any global settings
    }
  }, [settings]);

  useEffect(() => {
    // Initialize app context
    appContextAction.app.default();
  }, [appContextAction]);

  return (
      <Layout style={{ minHeight: '100vh' }}>
        <AppRouter />
      </Layout>
  );
};

export default FileMasterOs;