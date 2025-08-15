import { useEffect, useRef } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { useAppContext } from '@/context/appContext';
import routes from './routes';
import { matchPath } from 'react-router-dom';

export default function AppRouter() {
  const location = useLocation();
  const { appContextAction } = useAppContext();
  const { app } = appContextAction;
  const previousPathRef = useRef(location.pathname);

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
    // Only update app context if the path has actually changed
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      
      if (location.pathname === '/') {
        app.default();
      } else {
        const appName = getAppNameByPath(location.pathname);
        app.open(appName);
      }
    }
  }, [location.pathname, app]);

  return (
    <Routes>
      {routesList.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
}
