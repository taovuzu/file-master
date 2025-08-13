import React from "react";
import { Form, Input } from "antd";
import { MailOutlined  } from "@ant-design/icons";

const ForgetPasswordForm = () => {
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
    </div>
  );
}

export default ForgetPasswordForm;
