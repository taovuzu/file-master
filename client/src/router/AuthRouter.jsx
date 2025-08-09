import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import ForgetPassword from '@/pages/ForgetPassword';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

export default function AuthRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      <Route path="/forgetpassword" element={<ForgetPassword />} />
      <Route path="/resetpassword/:userId/:resetToken" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
