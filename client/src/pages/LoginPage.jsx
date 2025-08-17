import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { useDispatch, useSelector } from "react-redux";
import { login, googleLogin } from "@/redux/auth/actions";
import { selectAuthState } from "@/redux/auth/selectors";

const LoginPage = () => {
  const { isLoading, isSuccess } = useSelector(selectAuthState);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = (values) => {
    dispatch(login({ loginData: values }));
  };

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <AuthForm type="login" onFinish={handleLogin} loading={isLoading} />
      
      <Divider>or</Divider>
      
      <Button
        type="default"
        size="large"
        block
        icon={<GoogleOutlined />}
        onClick={handleGoogleLogin}
        style={{ marginBottom: '16px' }}
      >
        Continue with Google
      </Button>
    </AuthLayout>
  );
};

export default LoginPage;
