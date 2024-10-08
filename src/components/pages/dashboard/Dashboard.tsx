"use client";
import styles from "./Dashboard.module.scss";
import classNames from "classnames/bind";
import { Flex, Space, Typography } from "antd";
import { useSession } from "next-auth/react";
import CustomBarChart from "@/components/charts/MonthlyRevenue";

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
        align="flex-start"
      >
        <div style={{ width: "100%", height: "100%", padding: "0 5rem" }}>
          <Title>Thống kê doanh thu theo tháng</Title>
          <CustomBarChart />
        </div>
      </Flex>
    </div>
  );
};

export default Dashboard;
