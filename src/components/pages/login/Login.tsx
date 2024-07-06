"use client";

import { Button, Form, Input } from "antd";
import { LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { LoginRequest } from "@/types/auth";

const phoneNumberRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;

export default function Login() {
  const onFinish = (values: LoginRequest) => {
    console.log(values);
  };

  return (
    <Form
      name="login"
      onFinish={onFinish}
      layout="vertical"
      requiredMark="optional"
    >
      <Form.Item
        validateStatus=""
        name="phoneNumber"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập số điện thoại!",
          },
          {
            pattern: phoneNumberRegex,
            message: "Số điện thoại không hợp lệ!",
          },
        ]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập mật khẩu!",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: "0px" }}>
        <Button block={true} type="primary" htmlType="submit">
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  );
}
