import React from "react";
import { Form, Input } from "antd";
import { MailOutlined , LockOutlined } from "@ant-design/icons";

const RegisterForm = () => {
  return (
    <div>
      <Form.Item
        label={"email"}
        name="email"
        rules={[
          {
            required: true,
          },
          {
            type: "email",
          },
        ]}
      >
        <Input
          prefix={<MailOutlined  className="site-form-item-icon" />}
          placeholder={""}
          type="email"
          size="large"
        />
      </Form.Item>
      <Form.Item
        label={"password"}
        name="password"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={""}
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={"confirm_password"}
        name="confirm_password"
        dependencies={['password']}
        rules={[
          {
            required: true,
          },
          ({getFieldValue}) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value ) {
                return Promise.resolve();
              }
              return Promise.reject('Password do not match');
            }
          })
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={""}
          size="large"
        />
      </Form.Item>
    </div>
  );
}

export default RegisterForm;
