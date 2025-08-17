import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/auth/actions";
import { selectAuthState } from "@/redux/auth/selectors";

const LoginPage = () => {
  const { isLoading, isSuccess } = useSelector(selectAuthState);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = (values) => {
    dispatch(login({ loginData: values }));
  };

  // useEffect(() => {
  //   if (isSuccess) navigate("/");
  // }, [isSuccess]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <AuthForm type="login" onFinish={handleLogin} loading={isLoading} />
    </AuthLayout>
  );
};

export default LoginPage;
