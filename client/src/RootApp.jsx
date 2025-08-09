import { Suspense, lazy } from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "@/redux/store";
import PageLoader from "@/components/PageLoader";

const FileMasterOs = lazy(() => import("./apps/FileMasterOs.jsx"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <Provider store={store}>
          <Suspense fallback={<PageLoader />}>
            <FileMasterOs />
          </Suspense>
        </Provider>
      }
    />
  )
);

function RootApp() {
  return <RouterProvider router={router} />;
}

export default RootApp;