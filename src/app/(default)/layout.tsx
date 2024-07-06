import type { Metadata } from "next";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sidebar from "@/components/sidebar";
import AppHeader from "@/components/header/Header";

export const metadata: Metadata = {
  icons: {
    icon: "/basic-logo.png",
  },
  title: "Dashboard - GUDS",
  description: "Trang quản lý dành cho admin",
};

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout hasSider={true} style={{ height: "100vh" }}>
      <Sidebar />
      <Layout>
        <AppHeader />
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}
