"use client";
import styles from "./Blog.module.scss";
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
  EyeOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CategoryModal, {
  CategoryModalType,
} from "@/components/modal/category/CategoryModal";
import Column from "antd/es/table/Column";
import CategoryTableModal from "@/components/modal/categoryTableModal";
import ProductTableModal from "@/components/modal/productTableModal";
import { ProductTableModalType } from "@/components/modal/productTableModal/ProductTableModal";
import { BlogCategory } from "@/types/blog";
import { getAllBlogCategories } from "@/services/blog";
import day from "@/lib/day";
import CreateUpdateBlogCategory from "@/components/modal/blog/CreateUpdateBlogCategory";
import BlogTableModal from "@/components/modal/blog/BlogTable";

const cx = classNames.bind(styles);

const BlogPage = () => {
  const [data, setData] = useState<BlogCategory[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<BlogCategory[]>([]);
  const [modalType, setModalType] = useState<"CREATE" | "UPDATE">("CREATE");
  const [modalValue, setModalValue] = useState<BlogCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(-1);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res = await getAllBlogCategories();
        console.log(res);
        if (res) {
          setData(res);
        }
      } catch (error) {
        if (error instanceof Error) {
          messageApi.open({
            type: "error",
            content: error.message,
          });
        }
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
    setModalType("CREATE");
    setIsModalOpen(true);
  };

  const showEditModal = (item: BlogCategory) => {
    setModalValue(item);
    setModalType("UPDATE");
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModalType("CREATE");
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

  const openTableModal = (categoryId: number) => {
    setIsTableModalOpen(true);
    setCurrentCategoryId(categoryId);
  };

  const cancelTableModal = () => {
    setIsTableModalOpen(false);
    setCurrentCategoryId(-1);
  };

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách danh mục bài viết</Title>
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
              Thêm danh mục bài viết
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
        <Column
          title="Id"
          dataIndex="id"
          key="id"
          sorter={(a: BlogCategory, b: BlogCategory) => {
            return a.id - b.id;
          }}
        />
        <Column title="Tên danh mục bài viết" dataIndex="name" key="name" />
        <Column
          title="Mô tả"
          dataIndex="description"
          key="description"
          ellipsis={true}
        />
        <Column
          title="Ngày tạo"
          dataIndex="createAt"
          key="createAt"
          render={(text) => day(text).format("DD/MM/YYYY")}
        />
        <Column
          title="Bài viết"
          key="action"
          render={(_category: BlogCategory) => (
            <Button
              type="primary"
              className={cx("btn")}
              onClick={() => openTableModal(_category.id)}
            >
              <EyeOutlined />
              Xem
            </Button>
          )}
        />
        <Column
          title="Hành động"
          key="action"
          render={(_category: BlogCategory) => (
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
      <CreateUpdateBlogCategory
        type={modalType}
        value={modalValue}
        open={isModalOpen}
        onCancel={handleCancel}
        onFinish={handleRefresh}
      />
      <BlogTableModal
        blogCategoryId={currentCategoryId}
        open={isTableModalOpen}
        onCancel={cancelTableModal}
      />
      {contextHolder}
    </div>
  );
};

export default BlogPage;
