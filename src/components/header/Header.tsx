"use client";
import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import { Header } from "antd/es/layout/layout";
import {
  Avatar,
  Badge,
  Button,
  Divider,
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
import { io } from "socket.io-client";
import { Notification } from "@/types/notification";
import {
  getNotifications,
  updateNotificationStatus,
} from "@/services/notification";
import day from "@/lib/day";

const cx = classNames.bind(styles);
const { Text, Title } = Typography;

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
  const [notiPage, setNotiPage] = useState<number>(1);
  const [showLoadMore, setShowLoadMore] = useState<boolean>(true);
  const [unreadNotification, setUnreadNotification] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!session) {
        const sessionData = await getSession();
        setSession(sessionData);
      }
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

  useEffect(() => {
    handleLoadNoti();
  }, [session]);

  const handleLoadNoti = async () => {
    if (session) {
      const result = await getNotifications(notiPage);
      if (result.data && result.meta) {
        setNotifications((prev) => {
          const newValue = [...prev];
          result.data.map(function (item) {
            const isExist = newValue.findIndex((i) => i.id === item.id);
            if (isExist === -1) {
              newValue.push(item);
            }
          });
          return newValue;
        });
        setUnreadNotification(result.meta.unreadNotifications);
        if (result.meta.currentPage < result.meta.totalPages) {
          setNotiPage(result.meta.currentPage + 1);
          setShowLoadMore(true);
        } else {
          setShowLoadMore(false);
        }
      }
    }
  };

  const handleUpdateStatus = async () => {
    const unreadNotis = notifications.filter((item) => item.isRead === false);
    const unreadNotiIds = unreadNotis.map((item) => item.id);
    const newUnreadNotis = await updateNotificationStatus(unreadNotiIds);
    setUnreadNotification(newUnreadNotis);
    setTimeout(() => {
      setNotifications((prev) => {
        const newValue = prev.map((item) => {
          if (item.isRead === false) {
            item.isRead = true;
          }
          return item;
        });
        return newValue;
      });
    }, 1000);
  };

  useEffect(() => {
    if (session) {
      const userId = session.user.user.id;

      const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
        query: { userId },
      });

      socket.on("new-notification", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadNotification((prev) => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    signOut();
  };

  const notificationItems: MenuProps["items"] = notifications.map(
    (noti, index) => ({
      key: noti.id,
      label: (
        <Flex
          onClick={() => router.push("/order")}
          gap={8}
          style={{
            padding: 12,
            width: 350,
            borderBottom:
              index < notifications.length - 1 ? "1px solid #E5E7EB" : "",
          }}
        >
          {noti.isRead === false && <Badge status="success" />}
          <Flex vertical style={{ flex: 1 }}>
            <Title level={5} style={{ fontSize: 14 }}>
              {noti.message}
            </Title>
            <Text style={{ fontSize: 12, color: "#666" }}>
              {day(noti.createAt).fromNow()}
            </Text>
          </Flex>
        </Flex>
      ),
    })
  );

  notificationItems.push({
    key: "load-more",
    label: (
      <>
        <Flex justify="center">
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              handleUpdateStatus();
            }}
            type="link"
          >
            Đánh dấu là đã xem
          </Button>
          {showLoadMore && (
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                handleLoadNoti();
              }}
              type="link"
            >
              Xem thêm
            </Button>
          )}
        </Flex>
      </>
    ),
  });

  return (
    <>
      <Header className={cx("header")}>
        <Flex className={cx("flex")} align="center" justify="end">
          <Space size={"large"}>
            <Flex
              className={cx("flex", "mr-1")}
              align="center"
              justify="center"
            >
              <Dropdown
                menu={{ items: notificationItems }}
                placement="bottomLeft"
                overlayClassName="custom-dropdown-menu"
              >
                <Badge count={unreadNotification}>
                  <BellOutlined className={cx("icon")} />
                </Badge>
              </Dropdown>
            </Flex>
            <Flex className={cx("flex")} align="center" justify="center">
              {session && session.user && session.user.user && (
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
