"use client";
import styles from "./Login.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Flex,
  Form,
  Image,
  Input,
  message,
  Space,
  Typography,
} from "antd";
import { LockOutlined, PhoneOutlined, LeftOutlined } from "@ant-design/icons";
import { LoginRequest } from "@/types/auth";
import { doCredentialLogin } from "@/actions";
import { useState } from "react";

const cx = classNames.bind(styles);
const phoneNumberRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: LoginRequest) => {
    const formData = new FormData();
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("password", values.password);
    try {
      setLoading(true);
      await doCredentialLogin(formData);
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" className={cx("container")}>
      <Space className={cx("wrapper")} size={"large"}>
        <Image
          src="./images/logo.png"
          alt="logo"
          preview={false}
          width={100}
          height={50}
        />
        <Title>Đăng nhập</Title>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
          className={cx("form")}
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
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Số điện thoại"
              size="large"
            />
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
              placeholder="Mật khẩu"
              size="large"
              autoComplete="on"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button
              className={cx("submit-button")}
              block={true}
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Space>
      {contextHolder}
    </Flex>
  );
}
