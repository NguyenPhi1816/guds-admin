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
  FireOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
  getItem(<Link href="/">Trang chủ</Link>, "/", <HomeOutlined />),
  getItem(
    <Link href="/category">Danh mục sản phẩm</Link>,
    "/category",
    <ProductOutlined />
  ),
  getItem(<Link href="/brand">Nhãn hàng</Link>, "/brand", <TagsOutlined />),
  getItem(
    <Link href="/product">Sản phẩm</Link>,
    "/product",
    <MobileOutlined />
  ),
  getItem(
    <Link href="/customer">Khách hàng</Link>,
    "/customer",
    <TeamOutlined />
  ),
  getItem(<Link href="/order">Đơn hàng</Link>, "/order", <TruckOutlined />),
  getItem(
    <Link href="/promotion">Khuyến mãi</Link>,
    "/promotion",
    <FireOutlined />
  ),
  getItem(<Link href="/blog">Bài viết</Link>, "/blog", <FileTextOutlined />),
  getItem(
    <Link href="/recommendation">Gợi ý sản phẩm</Link>,
    "/recommendation",
    <ReloadOutlined />
  ),
];

const cx = classNames.bind(styles);

const Sidebar = () => {
  const pathName = usePathname();

  return (
    <Sider width={"20vw"} className={cx("sidebar")}>
      <Flex align="center">
        <Link href="/dashboard" className={cx("logo")}>
          <Image
            src="./images/logo.png"
            preview={false}
            width={80}
            height={40}
          />
        </Link>
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
