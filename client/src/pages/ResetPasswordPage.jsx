import React, { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { resetPasswordWithToken } from "@/redux/auth/actions";

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const email = query.get("email");
  const unHashedToken = query.get("unHashedToken");

  useEffect(() => {
    if (!email || !unHashedToken) {
      message.error("Invalid or expired password reset link.");
      navigate("/login");
    }
  }, [email, unHashedToken, navigate]);

  const handleResetPassword = async (values) => {
    if (!email || !unHashedToken) return;

    setLoading(true);
    try {
      const resetPasswordData = {
        email,
        unHashedToken,
        newPassword: values.password
      };

      const result = await dispatch(resetPasswordWithToken(resetPasswordData));
      if (result.meta.requestStatus === "fulfilled") {
        message.success("Password has been reset successfully!");
        navigate("/login");
      } else {
        message.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      message.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      <AuthForm
        type="resetPassword"
        onFinish={handleResetPassword}
        loading={loading} />
      
    </AuthLayout>);

};

export default ResetPasswordPage;