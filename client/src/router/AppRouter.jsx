import { useEffect, useRef, Suspense } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openApp as openAppAction, resetApp as resetAppAction } from '@/redux/app';
import routes from './routes';
import { matchPath } from 'react-router-dom';
import PageLoader from '@/components/PageLoader';

export default function AppRouter() {
  const location = useLocation();
  const dispatch = useDispatch();
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
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;

      if (location.pathname === '/') {
        dispatch(resetAppAction());
      } else {
        const appName = getAppNameByPath(location.pathname);
        dispatch(openAppAction(appName));
      }
    }
  }, [location.pathname, dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {routesList.map((route, index) =>
          <Route
            key={index}
            path={route.path}
            element={route.element} />
        )}
      </Routes>
    </Suspense>);
}