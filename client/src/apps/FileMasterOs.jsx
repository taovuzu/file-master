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
  // const dispatch = useDispatch();
  // const { appContextAction } = useAppContext();
  // const settings = useSelector(selectAllSettings);
  const isSettingsLoading = useSelector(selectSettingsLoading);

  // useLayoutEffect(() => {
  //   // Initialize theme before rendering to prevent flash
  //   themeUtils.initializeTheme();
    
  //   // Initialize app settings
  //   const initializeSettings = async () => {
  //     try {
  //       // Try to load settings from storePersist first
  //       const cachedSettings = storePersist.get('settings');
        
  //       if (cachedSettings && Object.keys(cachedSettings).length > 0) {
  //         // If we have cached settings, use them immediately
  //         // The Redux store will be updated when the API call completes
  //       }
        
  //       // Fetch fresh settings from API
  //       await dispatch(listSettings({ entity: 'settings' })).unwrap();
        
  //       logUserAction('app_initialized', { 
  //         hasSettings: !!settings,
  //         settingsCount: Object.keys(settings || {}).length 
  //       });
  //     } catch (error) {
  //       console.error('Failed to initialize settings:', error);
  //       logUserAction('settings_init_error', { error: error.message });
  //     }
  //   };

  //   initializeSettings();
  // }, [dispatch]);

  // useEffect(() => {
  //   // Initialize app context
  //   appContextAction.app.default();
    
  //   // Log app startup
  //   logUserAction('app_started', {
  //     timestamp: new Date().toISOString(),
  //     userAgent: navigator.userAgent,
  //     viewport: `${window.innerWidth}x${window.innerHeight}`
  //   });
  // }, [appContextAction]);

  // useEffect(() => {
  //   // Apply global settings when they change
  //   if (settings && Object.keys(settings).length > 0) {
  //     // Apply theme settings
  //     if (settings.general?.theme) {
  //       themeUtils.applyTheme(settings.general.theme);
  //     }
      
  //     // Apply language settings
  //     if (settings.general?.language) {
  //       document.documentElement.lang = settings.general.language;
  //     }
      
  //     // Apply UI settings
  //     if (settings.ui) {
  //       // Apply custom CSS variables for theming
  //       const root = document.documentElement;
  //       if (settings.ui.primaryColor) {
  //         root.style.setProperty('--primary-color', settings.ui.primaryColor);
  //       }
  //       if (settings.ui.borderRadius) {
  //         root.style.setProperty('--border-radius', `${settings.ui.borderRadius}px`);
  //       }
  //       if (settings.ui.fontSize) {
  //         root.style.setProperty('--font-size', `${settings.ui.fontSize}px`);
  //       }
  //     }
      
  //     logUserAction('settings_applied', { 
  //       settingsApplied: Object.keys(settings).length 
  //     });
  //   }
  // }, [settings]);

  // Show loading spinner while settings are being fetched
  if (isSettingsLoading && Object.keys(settings || {}).length === 0) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Loading application..." />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppRouter />
    </Layout>
  );
};

export default FileMasterOs;
