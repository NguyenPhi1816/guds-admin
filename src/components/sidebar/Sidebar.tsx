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
  HomeOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";

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
  getItem(<a href="/">Trang chủ</a>, "/", <HomeOutlined />),
  getItem(
    <a href="/category">Danh mục sản phẩm</a>,
    "/category",
    <ProductOutlined />
  ),
  getItem(<a href="/brand">Nhãn hàng</a>, "/brand", <TagsOutlined />),
  getItem(<a href="/product">Sản phẩm</a>, "/product", <MobileOutlined />),
  getItem(<a href="/customer">Khách hàng</a>, "/customer", <TeamOutlined />),
  getItem(<a href="/order">Đơn hàng</a>, "/order", <TruckOutlined />),
];

const cx = classNames.bind(styles);

const Sidebar = () => {
  const pathName = usePathname();

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
        selectedKeys={[pathName]}
      />
    </Sider>
  );
};

export default Sidebar;
