import { useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import { useAppContext } from '@/context/appContext';
import routes from './routes';
import { matchPath } from 'react-router-dom';

export default function AppRouter() {
  const location = useLocation();
  const { appContextAction } = useAppContext();
  const { app } = appContextAction;

  const routesList = Object.values(routes).flat();

  const getAppNameByPath = (path) => {
    for (let key in routes) {
      for (let route of routes[key]) {
        if (matchPath({ path: route.path, end: false }, path)) {
          return key;
        }
      }
    }
    return 'default';
  };

  useEffect(() => {
    if (location.pathname === '/') {
      app.default();
    } else {
      app.open(getAppNameByPath(location.pathname));
    }
  }, [location, app]);

  return useRoutes(routesList);
}
