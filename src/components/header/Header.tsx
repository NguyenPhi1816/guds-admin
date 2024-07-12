"use client";
import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import { Header } from "antd/es/layout/layout";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Space,
  Typography,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import { getSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";

const cx = classNames.bind(styles);
const { Text } = Typography;

const items: MenuProps["items"] = [
  {
    key: "1",
    label: <div onClick={() => signOut()}>Đăng Xuất</div>,
  },
];

const AppHeader = () => {
  const fallbackUserAvatarUrl = "/images/no-user-image.webp";

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
  }, []);

  return (
    <Header className={cx("header")}>
      <Flex className={cx("flex")} align="center" justify="end">
        <Space size={"large"}>
          <Flex className={cx("flex", "mr-1")} align="center" justify="center">
            <Badge count={5}>
              <BellOutlined className={cx("icon")} />
            </Badge>
          </Flex>
          <Flex className={cx("flex")} align="center" justify="center">
            {session && session.user && (
              <Dropdown menu={{ items }} placement="bottomLeft">
                <Space>
                  <Text className={cx("user-name")}>{session.user.name}</Text>
                  <Avatar
                    src={
                      session.user.image
                        ? session.user.image
                        : fallbackUserAvatarUrl
                    }
                    alt={session.user.name}
                    size={"large"}
                  />
                </Space>
              </Dropdown>
            )}
          </Flex>
        </Space>
      </Flex>
    </Header>
  );
};

export default AppHeader;
