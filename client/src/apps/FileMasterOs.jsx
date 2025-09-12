import { useLayoutEffect, useEffect } from 'react';
import { selectAllSettings, selectSettingsLoading } from '@/redux/settings/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Spin } from 'antd';
import { listSettings } from '@/redux/settings/actions';


import AppRouter from '@/router/AppRouter';
import { themeUtils } from '@/utils/theme';
import storePersist from '@/redux/storePersist';
import { logUserAction } from '@/utils/logger';

const FileMasterOs = () => {


  const settings = useSelector(selectAllSettings);
  const isSettingsLoading = useSelector(selectSettingsLoading);















































































  if (isSettingsLoading && Object.keys(settings || {}).length === 0) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Loading application..." />
      </Layout>);

  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppRouter />
    </Layout>);

};

export default FileMasterOs;