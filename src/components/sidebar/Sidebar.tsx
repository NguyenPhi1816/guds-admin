"use client";
import styles from "./Sidebar.module.scss";
import classNames from "classnames/bind";
import { Flex, Image, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  ProductOutlined,
  TagsOutlined,
  TruckOutlined,
  TeamOutlined,
  MobileOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(<a href="/category">Danh mục sản phẩm</a>, "1", <ProductOutlined />),
  getItem("Nhãn hàng", "2", <TagsOutlined />),
  getItem("Sản phẩm", "sub1", <MobileOutlined />),
  getItem("Khách hàng", "sub2", <TeamOutlined />),
  getItem("Đơn hàng", "9", <TruckOutlined />),
];

const cx = classNames.bind(styles);

const Sidebar = () => {
  return (
    <Sider width={"20vw"} className={cx("sidebar")}>
      <Flex align="center">
        <a className={cx("logo")}>
          <Image
            src="./images/logo.png"
            preview={false}
            width={80}
            height={40}
          />
        </a>
      </Flex>
      <Menu
        className={cx("menu")}
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={items}
      />
    </Sider>
  );
};

export default Sidebar;
