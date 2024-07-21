"use client";
import styles from "./Dashboard.module.scss";
import classNames from "classnames/bind";
import { Flex, Typography } from "antd";
import { useSession } from "next-auth/react";

const { Title } = Typography;

const cx = classNames.bind(styles);

const Dashboard: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div className={cx("dashboard")}>
      <Flex
        className={cx("dashboard-flex")}
        vertical
        justify="center"
        align="center"
      >
        <div className={cx("dashboard-logo")}>
          <img src="/images/logo.png" />
        </div>
        <Title>Chào mừng quay trở lại</Title>
        <Title level={3}>{session?.user.name}</Title>
      </Flex>
    </div>
  );
};

export default Dashboard;
