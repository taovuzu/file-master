import React from "react";
import { Form, Input, Button, Checkbox, Typography, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone } from
"@ant-design/icons";
import { Link } from "react-router-dom";

const { Text } = Typography;

const AuthForm = ({
  type = "login",
  onFinish,
  loading = false,
  config = {},
  email = ""
}) => {
  const [form] = Form.useForm();

  const renderFormFields = () => {
    switch (type) {
      case "login":
        return (
          <>
            <Form.Item
              label="Email"
              name="email"
              rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" }]
              }>
              
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large" />
              
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
              { required: true, message: "Please enter your password!" }]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>
            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link to="/forgot-password">Forgot password?</Link>
              </Space>
            </Form.Item>
          </>);


      case "registerEmail":
        return (
          <Form.Item
            label="Email"
            name="email"
            rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" }]
            }>
            
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your Email"
              size="large" />
            
          </Form.Item>);


      case "verifyOTP":
        return (
          <>
            <Form.Item
              label="OTP Code"
              name="otp"
              rules={[
              { required: true, message: "Please enter the OTP code!" },
              { len: 6, message: "OTP must be 6 digits!" }]
              }>
              
              <Input
                placeholder="Enter 6-digit OTP"
                size="large"
                maxLength={6} />
              
            </Form.Item>
          </>);


      case "register":
        return (
          <>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
              { required: true, message: "Please enter your full name!" }]
              }>
              
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                size="large" />
              
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input
                prefix={<MailOutlined />}
                placeholder={email}
                size="large"
                disabled />
              
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
              { required: true, message: "Please enter your password!" },
              { min: 6, message: "Password must be at least 6 characters!" }]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                }
              })]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>
            <Form.Item>
              <Form.Item name="agree" valuePropName="checked" noStyle>
                <Checkbox>
                  I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                  <Link to="/privacy">Privacy Policy</Link>
                </Checkbox>
              </Form.Item>
            </Form.Item>
          </>);


      case "forgetPassword":
        return (
          <Form.Item
            label="Email"
            name="email"
            rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" }]
            }>
            
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large" />
            
          </Form.Item>);


      case "resetPassword":
        return (
          <>
            <Form.Item
              label="New Password"
              name="password"
              rules={[
              { required: true, message: "Please enter your new password!" },
              { min: 6, message: "Password must be at least 6 characters!" }]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your new password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
              {
                required: true,
                message: "Please confirm your new password!"
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                }
              })]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your new password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>
          </>);




      case "changeCurrentPassword":
        return (
          <>
            <Form.Item
              label="Old Password"
              name="oldPassword"
              rules={[
              { required: true, message: "Please enter your old password!" }]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your old password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
              { required: true, message: "Please enter your new password!" },
              { min: 6, message: "Password must be at least 6 characters!" }]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your new password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmNewPassword"
              dependencies={["newPassword"]}
              rules={[
              {
                required: true,
                message: "Please confirm your new password!"
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                }
              })]
              }>
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your new password"
                size="large"
                iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                } />
              
            </Form.Item>
          </>);


      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case "login":
        return "Sign In";
      case "register":
        return "Sign Up";
      case "registerEmail":
        return "Send Verification Email";
      case "verifyOTP":
        return "Verify OTP";
      case "forgetPassword":
        return "Send Reset Link";
      case "resetPassword":
        return "Reset Password";
      case "changeCurrentPassword":
        return "Change Password";
      default:
        return "Submit";
    }
  };

  const getFooterText = () => {
    switch (type) {
      case "login":
        return (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Text>Don't have an account? </Text>
            <Link to="/register">Sign up</Link>
          </div>);

      case "register":
        return (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Text>Already have an account? </Text>
            <Link to="/login">Sign in</Link>
          </div>);

      case "registerEmail":
        return (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Text>Already have an account? </Text>
            <Link to="/login">Sign in</Link>
          </div>);

      case "verifyOTP":
        return <></>;
      case "forgetPassword":
        return (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Text>Remember your password? </Text>
            <Link to="/login">Sign in</Link>
          </div>);

      default:
        return null;
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
      {renderFormFields()}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          size="large">
          
          {config.buttonText || getButtonText()}
        </Button>
      </Form.Item>

      {getFooterText()}
    </Form>);

};

export default AuthForm;