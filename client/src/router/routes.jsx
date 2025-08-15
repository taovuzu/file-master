import { lazy } from "react";
import { Navigate } from "react-router-dom";

// Lazy load components
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const StyleDemoPage = lazy(() => import("@/pages/StyleDemoPage"));

// PDF Tool Pages
const MergePdfPage = lazy(() => import("@/pages/MergePdfPage"));
const SplitPdfPage = lazy(() => import("@/pages/SplitPdfPage"));
const CompressPdfPage = lazy(() => import("@/pages/CompressPdfPage"));
const ConvertPdfPage = lazy(() => import("@/pages/ConvertPdfPage"));
const ProtectPdfPage = lazy(() => import("@/pages/ProtectPdfPage"));
const UnlockPdfPage = lazy(() => import("@/pages/UnlockPdfPage"));
const RotatePdfPage = lazy(() => import("@/pages/RotatePdfPage"));
const WatermarkPdfPage = lazy(() => import("@/pages/WatermarkPdfPage"));
const PageNumbersPdfPage = lazy(() => import("@/pages/PageNumbersPdfPage"));
const DownloadPage = lazy(() => import("@/pages/DownloadPage"));

const routes = {
  default: [
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/home",
      element: <HomePage />,
    },
    {
      path: "/demo",
      element: <StyleDemoPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    // PDF Tool Routes
    {
      path: "/merge",
      element: <MergePdfPage />,
    },
    {
      path: "/split",
      element: <SplitPdfPage />,
    },
    {
      path: "/compress",
      element: <CompressPdfPage />,
    },
    {
      path: "/convert",
      element: <ConvertPdfPage />,
    },
    {
      path: "/protect",
      element: <ProtectPdfPage />,
    },
    {
      path: "/unlock",
      element: <UnlockPdfPage />,
    },
    {
      path: "/rotate",
      element: <RotatePdfPage />,
    },
    {
      path: "/watermark",
      element: <WatermarkPdfPage />,
    },
    {
      path: "/page-numbers",
      element: <PageNumbersPdfPage />,
    },
    {
      path: "/download",
      element: <DownloadPage />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
};

export default routes;
