"use client";
import styles from "./Category.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, Modal, Space, Table, TableProps } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { CategoryResponse } from "@/types/category";
import { getAllCategory } from "@/services/category";
import {
  EditOutlined,
  LockOutlined,
  PhoneOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AddCategoryModal from "@/components/modal/category/AddCategoryModal";

const cx = classNames.bind(styles);

const columns: TableProps<CategoryResponse>["columns"] = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Slug",
    dataIndex: "slug",
    key: "slug",
  },
  {
    title: "Tên danh mục",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Danh mục cha",
    dataIndex: "parent",
    key: "parent",
    render: (_, { parent }) => {
      if (parent) return <>{parent.name}</>;
      return <>Không có</>;
    },
  },
  {
    title: "Sản phẩm",
    dataIndex: "numberOfBaseProduct",
    key: "numberOfBaseProduct",
    render: (_, { numberOfBaseProduct }) => (
      <Button>{numberOfBaseProduct}</Button>
    ),
  },
  {
    title: "Danh mục con",
    dataIndex: "numberOfChildren",
    key: "numberOfChildren",
    render: (_, { numberOfChildren }) => <Button>{numberOfChildren}</Button>,
  },
  {
    title: "Hành động",
    dataIndex: "action",
    key: "action",
    render: (_, record) => (
      <Button type="primary" className={cx("btn")}>
        <EditOutlined />
        Chỉnh sửa
      </Button>
    ),
  },
];

const CategoryPage = () => {
  const [data, setData] = useState<CategoryResponse[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res = await getAllCategory();
        if (res) {
          setData(res);
        }
      } catch (error) {
        throw error;
      } finally {
        setRefresh(false);
        setIsLoading(false);
      }
    };
    fetcher();
  }, [refresh]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleRefresh = () => {
    setRefresh(true);
  };

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách danh mục sản phẩm</Title>
      <div className={cx("btn-wrapper")}>
        <Space>
          <Button
            onClick={handleRefresh}
            type="primary"
            className={cx("btn")}
            disabled={isLoading}
          >
            <ReloadOutlined />
            Tải lại
          </Button>
          <Button
            onClick={showModal}
            type="primary"
            className={cx("btn")}
            disabled={isLoading}
          >
            <PlusCircleOutlined />
            Thêm danh mục
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.id}
        loading={isLoading}
        pagination={false}
      />
      <AddCategoryModal
        open={isModalOpen}
        categories={data}
        onCancel={handleCancel}
        onFinish={handleRefresh}
      />
    </div>
  );
};

export default CategoryPage;
