import { lazy } from "react";
import { Navigate } from "react-router-dom";

// Core pages - loaded immediately
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Auth pages 
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const LogoutPage = lazy(() => import("@/pages/LogoutPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));

// User pages
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

// Info pages
const HelpCenterPage = lazy(() => import("@/pages/HelpCenterPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));

// PDF tool pages - most frequently used
const MergePdfPage = lazy(() => import("@/pages/MergePdfPage"));
const SplitPdfPage = lazy(() => import("@/pages/SplitPdfPage"));
const CompressPdfPage = lazy(() => import("@/pages/CompressPdfPage"));
const ConvertPdfPage = lazy(() => import("@/pages/ConvertPdfPage"));

// PDF tool pages - security features
const ProtectPdfPage = lazy(() => import("@/pages/ProtectPdfPage"));
const UnlockPdfPage = lazy(() => import("@/pages/UnlockPdfPage"));

// PDF tool pages - editing features
const RotatePdfPage = lazy(() => import("@/pages/RotatePdfPage"));
const WatermarkPdfPage = lazy(() => import("@/pages/WatermarkPdfPage"));
const PageNumbersPdfPage = lazy(() => import("@/pages/PageNumbersPdfPage"));

// PDF tool pages - advanced features
const DownloadPage = lazy(() => import("@/pages/DownloadPage"));
const PdfToPowerPointPage = lazy(() => import("@/pages/PdfToPowerPointPage"));
const PdfEditorPage = lazy(() => import("@/pages/PdfEditorPage"));
const OrganizePdfPage = lazy(() => import("@/pages/OrganizePdfPage"));

const routes = {
  default: [
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/home",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />
  },
  {
    path: "/change-password",
    element: <ChangePasswordPage />
  },
  {
    path: "/logout",
    element: <LogoutPage />
  },
  {
    path: "/profile",
    element: <ProfilePage />
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />
  },

  {
    path: "/help",
    element: <HelpCenterPage />
  },
  { path: "/contact", element: <HelpCenterPage initialTab="contact" /> },
  { path: "/privacy", element: <HelpCenterPage initialTab="privacy" /> },
  { path: "/terms", element: <HelpCenterPage initialTab="terms" /> },
  { path: "/pricing", element: <PricingPage /> },

  {
    path: "/merge",
    element: <MergePdfPage />
  },
  {
    path: "/split",
    element: <SplitPdfPage />
  },
  {
    path: "/compress",
    element: <CompressPdfPage />
  },
  {
    path: "/convert",
    element: <ConvertPdfPage />
  },
  {
    path: "/pdf-to-powerpoint",
    element: <PdfToPowerPointPage />
  },
  {
    path: "/protect",
    element: <ProtectPdfPage />
  },
  {
    path: "/unlock",
    element: <UnlockPdfPage />
  },
  {
    path: "/rotate",
    element: <RotatePdfPage />
  },
  {
    path: "/watermark",
    element: <WatermarkPdfPage />
  },
  {
    path: "/edit",
    element: <PdfEditorPage />
  },
  {
    path: "/organize",
    element: <OrganizePdfPage/>
  },
  {
    path: "/page-numbers",
    element: <PageNumbersPdfPage />
  },
  {
    path: "/download",
    element: <DownloadPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }]

};

export default routes;