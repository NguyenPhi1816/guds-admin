"use client";
import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import { Header } from "antd/es/layout/layout";
import { Avatar, Badge, Button, Flex, Space, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";

const cx = classNames.bind(styles);

const { Text } = Typography;

const AppHeader = () => {
  const userName = "John Doe";
  const userAvatarUrl = "";
  const fallbackUserAvatarUrl = "/no-user-image.webp";

  return (
    <Header className={cx("header")}>
      <Flex className={cx("flex")} align="center" justify="end">
        <Space size={"large"}>
          <Flex className={cx("flex")} align="center" justify="center">
            <Badge count={5}>
              <BellOutlined className={cx("icon")} />
            </Badge>
          </Flex>
          <Flex className={cx("flex")} align="center" justify="center">
            {/* <Space>
              <Text className={cx("user-name")}>{userName}</Text>
              <Avatar
                src={userAvatarUrl ? userAvatarUrl : fallbackUserAvatarUrl}
                alt={userName}
                size={"large"}
              />
            </Space> */}
            <Button href="/login">Đăng nhập</Button>
          </Flex>
        </Space>
      </Flex>
    </Header>
  );
};

export default AppHeader;
