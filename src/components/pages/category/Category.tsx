"use client";
import styles from "./Category.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Space,
  Table,
  Typography,
} from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { CategoryParentResponse, CategoryResponse } from "@/types/category";
import { getAllCategory } from "@/services/category";
import {
  EditOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CategoryModal, {
  CategoryModalType,
} from "@/components/modal/category/CategoryModal";
import Column from "antd/es/table/Column";

const cx = classNames.bind(styles);

const CategoryPage = () => {
  const [data, setData] = useState<CategoryResponse[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<CategoryResponse[]>([]);
  const [modalType, setModalType] = useState<CategoryModalType>(
    CategoryModalType.CREATE
  );
  const [modalValue, setModalValue] = useState<CategoryResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

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

  useEffect(() => {
    if (data) {
      const result = data.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSearchResult(result);
    }
  }, [data, searchValue]);

  const showCreateModal = () => {
    setModalType(CategoryModalType.CREATE);
    setIsModalOpen(true);
  };

  const showEditModal = (item: CategoryResponse) => {
    setModalValue(item);
    setModalType(CategoryModalType.EDIT);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModalType(CategoryModalType.CREATE);
    setModalValue(null);
  };

  const handleRefresh = (message: string) => {
    setRefresh(true);
    if (message !== "") {
      messageApi.open({
        type: "success",
        content: message,
      });
    }
  };

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách danh mục sản phẩm</Title>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Space>
              <Typography.Text>Tìm kiếm</Typography.Text>
              <Input
                placeholder="Tên danh mục"
                suffix={<SearchOutlined />}
                size="large"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
            </Space>
          </Form.Item>
        </Form>
        <div className={cx("btn-wrapper")}>
          <Space>
            <Button
              onClick={() => handleRefresh("")}
              type="primary"
              className={cx("btn")}
              disabled={isLoading}
            >
              <ReloadOutlined />
              Tải lại
            </Button>
            <Button
              onClick={showCreateModal}
              type="primary"
              className={cx("btn")}
              disabled={isLoading}
            >
              <PlusCircleOutlined />
              Thêm danh mục
            </Button>
          </Space>
        </div>
      </Flex>
      <Table
        dataSource={searchResult}
        rowKey={(record) => record.id}
        loading={isLoading}
        pagination={false}
      >
        <Column title="Id" dataIndex="id" key="id" />
        <Column title="Slug" dataIndex="slug" key="slug" />
        <Column title="Tên danh mục" dataIndex="name" key="name" />
        <Column title="Mô tả" dataIndex="description" key="description" />
        <Column
          title="Danh mục cha"
          dataIndex="parent"
          key="parent"
          render={(parent: CategoryParentResponse) => {
            if (parent) return <>{parent.name}</>;
            return <>Không có</>;
          }}
        />
        <Column
          title="Sản phẩm"
          dataIndex="numberOfBaseProduct"
          key="numberOfBaseProduct"
          render={(numberOfBaseProduct: number) => (
            <Button>{numberOfBaseProduct}</Button>
          )}
        />
        <Column
          title="Danh mục con"
          dataIndex="numberOfChildren"
          key="numberOfChildren"
          render={(numberOfChildren: number) => (
            <Button>{numberOfChildren}</Button>
          )}
        />
        <Column
          title="Hành động"
          key="action"
          render={(_category: CategoryResponse) => (
            <Button
              type="primary"
              className={cx("btn")}
              onClick={() => showEditModal(_category)}
            >
              <EditOutlined />
              Chỉnh sửa
            </Button>
          )}
        />
      </Table>
      <CategoryModal
        type={modalType}
        value={modalValue}
        open={isModalOpen}
        categories={data}
        onCancel={handleCancel}
        onFinish={handleRefresh}
      />
      {contextHolder}
    </div>
  );
};

export default CategoryPage;
