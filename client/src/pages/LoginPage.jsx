import React, { useEffect } from "react";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/auth/actions";
import { googleLogin } from "@/redux/auth/actions";
import { selectAuthState, selectIsLoggedIn } from "@/redux/auth/selectors";

const LoginPage = () => {
  const { isLoading } = useSelector(selectAuthState);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogin = (values) => {
    const query = new URLSearchParams(location.search);
    const qsRedirect = query.get("redirectTo");
    const stateRedirect = location.state && location.state.from;
    const current = qsRedirect || stateRedirect || "/home";
    try {
      window.localStorage.setItem("postLoginRedirect", current);
    } catch (_) {}
    dispatch(login({ loginData: values }));
  };

  const handleGoogleLogin = () => {
    const query = new URLSearchParams(location.search);
    const qsRedirect = query.get("redirectTo");
    const stateRedirect = location.state && location.state.from;
    const current = qsRedirect || stateRedirect || "/home";
    try {
      window.localStorage.setItem("postLoginRedirect", current);
    } catch (_) {}
    dispatch(googleLogin());
  };

  useEffect(() => {
    if (isLoggedIn) {
      let target = "/home";
      try {
        const stored = window.localStorage.getItem("postLoginRedirect");
        if (stored) target = stored;
        window.localStorage.removeItem("postLoginRedirect");
      } catch (_) {}
      navigate(target, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue">
      
      <Space direction="vertical" style={{ width: "100%" }}>
        <AuthForm type="login" onFinish={handleLogin} loading={isLoading} />
        <Button
          type="default"
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}>
          
          Continue with Google
        </Button>
      </Space>
    </AuthLayout>);

};

export default LoginPage;