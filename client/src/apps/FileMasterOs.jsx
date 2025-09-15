import { selectAllSettings, selectSettingsLoading } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';
import { Layout, Spin } from 'antd';

import AppRouter from '@/router/AppRouter';

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