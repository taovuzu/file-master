import React, { useState, useEffect } from "react";
import { Button, message, Card, Typography, Space } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "@/layout/AuthLayout";
import AuthForm from "@/forms/AuthForm";
import {
  registerEmail,
  registerUser,
  verifyEmailByOTP,
  resendVerification,
  clearEmailRegistrationStep,
  googleLogin } from
"@/redux/auth/actions";
import {
  selectEmailRegistrationStep,
  selectIsSuccess } from
"@/redux/auth/selectors";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("email");
  const [emailData, setEmailData] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [registrationToken, setRegistrationToken] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailRegistrationStep = useSelector(selectEmailRegistrationStep);
  const isSuccess = useSelector(selectIsSuccess);

  useEffect(() => {
    if (emailRegistrationStep && isSuccess) {
      setCurrentStep("otp");
    }

    if (!registrationToken) {
      const storedToken = window.localStorage.getItem('registrationToken');
      const storedEmail = window.localStorage.getItem('registrationEmail');
      if (storedToken && storedEmail) {
        setRegistrationToken(storedToken);
        setEmailData(storedEmail);
        setCurrentStep('userDetails');
      }
    }
  }, [emailRegistrationStep, isSuccess]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const verified = query.get("verified");
    const email = query.get("email");
    const linkToken = query.get("registrationToken");

    if (verified === "true" && email && linkToken) {
      setEmailData(email);
      setRegistrationToken(linkToken);
      window.localStorage.setItem('registrationToken', linkToken);
      window.localStorage.setItem('registrationEmail', email);
      setCurrentStep("userDetails");
      message.success("Email verified by link! Please complete registration.");
    }
  }, [location]);

  useEffect(() => {
    return () => {
      dispatch(clearEmailRegistrationStep());
    };
  }, [dispatch]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  const handleEmailRegistration = async (values) => {
    setLoading(true);
    try {
      const result = await dispatch(registerEmail({ email: values.email }));
      if (result.meta.requestStatus === "fulfilled") {
        setEmailData(values.email);
        setResendTimer(120);
        message.success(
          "Verification email sent! Please check your inbox and enter the OTP."
        );
      } else {
        message.error("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      const result = await dispatch(resendVerification({ email: emailData }));
      if (result.meta.requestStatus === "fulfilled") {
        setResendTimer(120);
        message.success("OTP resent! Please check your inbox.");
      } else {
        message.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
    }
  };

  const handleOTPVerification = async (values) => {
    setLoading(true);
    try {
      const result = await dispatch(
        verifyEmailByOTP({
          email: emailData,
          otp: values.otp
        })
      );
      if (result.meta.requestStatus === "fulfilled") {
        const token = result.payload?.registrationToken;
        if (token) {
          setRegistrationToken(token);
          window.localStorage.setItem('registrationToken', token);
          window.localStorage.setItem('registrationEmail', emailData);
        }
        setCurrentStep("userDetails");
        message.success("Email verified! Please complete your registration.");
      } else {
        message.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegistration = async (values) => {
    setLoading(true);
    try {
      const registerData = {
        fullName: values.fullName,
        password: values.password,
        registrationToken
      };

      const result = await dispatch(registerUser({ registerData }));
      if (result.meta.requestStatus === "fulfilled") {
        window.localStorage.removeItem('registrationToken');
        window.localStorage.removeItem('registrationEmail');
        navigate("/");
      } else {
        message.error("Registration failed. Please try again.");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <div>
            <Title
              level={3}
              style={{ textAlign: "center", marginBottom: "24px" }}>
              
              Step 1: Verify Your Email
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "24px"
              }}>
              
              Enter your email address to receive a verification code
            </Text>
            <AuthForm
              type="registerEmail"
              onFinish={handleEmailRegistration}
              loading={loading} />
            
            <Button
              type="default"
              size="large"
              block
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              style={{ marginBottom: "16px" }}>
              
              Continue with Google
            </Button>
          </div>);


      case "otp":
        return (
          <div>
            <Title
              level={3}
              style={{ textAlign: "center", marginBottom: "24px" }}>
              
              Step 2: Enter OTP
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "24px"
              }}>
              
              We've sent a 6-digit code to {emailData}
            </Text>
            <AuthForm
              type="verifyOTP"
              onFinish={handleOTPVerification}
              loading={loading} />
            
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Text>Didn't receive the code? </Text>
              {resendTimer > 0 ?
              <Text type="secondary">Resend available in {resendTimer}s</Text> :

              <a onClick={handleResendOTP} style={{ cursor: "pointer" }}>
                  Resend
                </a>
              }
            </div>
          </div>);


      case "userDetails":
        return (
          <div>
            <Title
              level={3}
              style={{ textAlign: "center", marginBottom: "24px" }}>
              
              Step 3: Complete Registration
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "24px"
              }}>
              
              Fill in your details to complete the registration
            </Text>
            <AuthForm
              type="register"
              onFinish={handleUserRegistration}
              loading={loading}
              email={emailData} />
            
          </div>);


      default:
        return null;
    }
  };

  const getStepIndicator = () => {
    const steps = [
    {
      key: "email",
      title: "Email",
      status:
      currentStep === "email" ?
      "current" :
      currentStep === "otp" || currentStep === "userDetails" ?
      "finish" :
      "wait"
    },
    {
      key: "otp",
      title: "OTP",
      status:
      currentStep === "otp" ?
      "current" :
      currentStep === "userDetails" ?
      "finish" :
      "wait"
    },
    {
      key: "userDetails",
      title: "Details",
      status: currentStep === "userDetails" ? "current" : "wait"
    }];


    return (
      <div style={{ marginBottom: "32px" }}>
        <Space size="large" style={{ width: "100%", justifyContent: "center" }}>
          {steps.map((step, index) =>
          <div key={step.key} style={{ textAlign: "center" }}>
              <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor:
                step.status === "finish" ?
                "#52c41a" :
                step.status === "current" ?
                "#1890ff" :
                "#d9d9d9",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
                fontWeight: "bold"
              }}>
              
                {step.status === "finish" ? "✓" : index + 1}
              </div>
              <Text
              style={{
                color:
                step.status === "finish" ?
                "#52c41a" :
                step.status === "current" ?
                "#1890ff" :
                "#8c8c8c"
              }}>
              
                {step.title}
              </Text>
            </div>
          )}
        </Space>
      </div>);

  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to get started with FileMaster">
      
      {getStepIndicator()}
      {renderStepContent()}
    </AuthLayout>);

};

export default RegisterPage;