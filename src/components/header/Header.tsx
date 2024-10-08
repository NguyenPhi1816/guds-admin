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
  Modal,
  Space,
  Typography,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import { getSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      const timerId = setTimeout(() => {
        showModal();
      }, new Date(session.user.expires).getTime() - Date.now());

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [session]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <Header className={cx("header")}>
        <Flex className={cx("flex")} align="center" justify="end">
          <Space size={"large"}>
            {/* <Flex className={cx("flex", "mr-1")} align="center" justify="center">
              <Badge count={5}>
                <BellOutlined className={cx("icon")} />
              </Badge>
            </Flex> */}
            <Flex className={cx("flex")} align="center" justify="center">
              {session && session.user.user && (
                <Dropdown menu={{ items }} placement="bottomLeft">
                  <Space>
                    <Text className={cx("user-name")}>
                      {session.user.user.name}
                    </Text>
                    <Avatar
                      src={
                        session.user.user.image
                          ? session.user.user.image
                          : fallbackUserAvatarUrl
                      }
                      alt={session.user.user.name}
                      size={"large"}
                    />
                  </Space>
                </Dropdown>
              )}
            </Flex>
          </Space>
        </Flex>
      </Header>
      <Modal
        title="Thông báo"
        footer={[
          <Button
            onClick={handleLogout}
            className={cx("btn")}
            type="primary"
            key={1}
          >
            Đăng nhập
          </Button>,
        ]}
        open={isModalOpen}
      >
        <p>Phiên làm việc hết hạn. Vui lòng đăng nhập lại</p>
      </Modal>
    </>
  );
};

export default AppHeader;
