import React, { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { changeCurrentPassword } from "@/redux/auth/actions";
import { selectIsLoggedIn } from "@/redux/auth/selectors";

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      message.error("Please request a reset link to continue.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleResetPassword = async (values) => {
    if (!isLoggedIn) return;

    setLoading(true);
    try {
      const resetPasswordData = {
        newPassword: values.password,
      };

      const result = await dispatch(changeCurrentPassword(resetPasswordData));
      if (result.meta.requestStatus === "fulfilled") {
        message.success("Password has been reset successfully!");
        navigate("/");
      } else {
        message.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      message.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      <AuthForm
        type="resetPassword"
        onFinish={handleResetPassword}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
