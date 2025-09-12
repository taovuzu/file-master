import React, { useState } from "react";
import { message, Form, Input, Button } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import { requestPasswordReset } from "@/redux/auth/actions";

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleForgotPassword = async (values) => {
    setLoading(true);
    try {
      const result = await dispatch(requestPasswordReset({ email: values.email }));
      if (result.meta.requestStatus === "fulfilled") {
        setEmail(values.email);
        setLinkSent(true);
        message.success("Reset link sent. Check your email.");
        navigate("/login", { replace: true });
      } else {
        message.error("Failed to send reset link. Please try again.");
      }
    } catch (error) {
      message.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={linkSent ? "Check your email" : "Forgot Password"}
      subtitle={
      linkSent ?
      `We’ve sent a password reset link to ${email}. Please check your inbox.` :
      "Enter your email to receive a password reset link"
      }>

      {!linkSent ?
      <Form layout="vertical" onFinish={handleForgotPassword}>
          <Form.Item
          label="Email"
          name="email"
          rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Please enter a valid email address" }]
          }>

            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form> :

      <div className="text-center">
          <p>If you don’t see the email, check your spam folder.</p>
          <p>You can close this window once you’ve clicked the reset link.</p>
        </div>
      }
    </AuthLayout>);

};

export default ForgotPasswordPage;