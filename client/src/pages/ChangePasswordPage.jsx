import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { changeCurrentPassword } from "@/redux/auth/actions";
import { selectIsLoggedIn } from "@/redux/auth/selectors";

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);

  const handleChangePassword = async (values) => {
    if (!isLoggedIn) {
      message.error("You must be logged in to change your password.");
      return;
    }

    const { oldPassword, newPassword } = values;

    setLoading(true);
    try {
      const payload = { oldPassword, newPassword };
      const result = await dispatch(changeCurrentPassword(payload));

      if (result.meta.requestStatus === "fulfilled") {
        message.success("Password changed successfully!");
        navigate("/");
      } else {
        message.error(result.payload || "Old password is incorrect.");
      }
    } catch (error) {
      message.error("Failed to change password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <AuthLayout title="Change Password" subtitle="Enter your old and new password">
      <AuthForm
        type="changeCurrentPassword"
        onFinish={handleChangePassword}
        loading={loading} />
      
    </AuthLayout>);

};

export default ChangePasswordPage;