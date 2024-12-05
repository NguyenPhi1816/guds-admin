import styles from "./Blog.module.scss";
import classNames from "classnames/bind";

import { productStatus } from "@/constant/enum/productStatus";
import day from "@/lib/day";
import { getCategoryBlog, updateBlogStatus } from "@/services/blog";
import { getBrandProduct } from "@/services/brand";
import { getCategoryProduct } from "@/services/category";
import { Blog } from "@/types/blog";
import { CategoryResponse } from "@/types/category";
import {
  EditOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Flex,
  message,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import Column from "antd/es/table/Column";
import React, { useEffect, useState } from "react";
import CreateUpdateBlog from "./CreateUpdateBlog";

export interface IBlogTableModal {
  blogCategoryId: number;
  open: boolean;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const BlogTableModal: React.FC<IBlogTableModal> = ({
  blogCategoryId,
  open,
  onCancel,
}) => {
  const [data, setData] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [currentBlogId, setCurrentBlogId] = useState<number>(-1);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    if (blogCategoryId) fetcher();
  }, [blogCategoryId]);

  const fetcher = async () => {
    try {
      setIsLoading(true);
      const blogs = await getCategoryBlog(blogCategoryId);
      setData(blogs);
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateUpdateModal = (blogId: number) => {
    setCurrentBlogId(blogId);
    setOpenModal(true);
  };

  const handleCloseCreateUpdateModal = () => {
    setCurrentBlogId(-1);
    setOpenModal(false);
  };

  const handleUpdateBlogStatus = async (
    id: number,
    status: "ACTIVE" | "INACTIVE"
  ) => {
    try {
      const result = await updateBlogStatus({ id, status });
      if (result) {
        messageApi.open({
          type: "success",
          content: "Cập nhật trạng thái thành công",
        });

        setData((prev) => {
          const blog = data.find((item) => item.id === id);
          if (!blog) {
            return prev;
          }
          blog.status = status;
          return [...prev.filter((item) => item.id !== id), blog];
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    }
  };

  return (
    <>
      <Modal
        destroyOnClose={true}
        title={"Danh sách bài viết thuộc danh mục"}
        open={open}
        onCancel={onCancel}
        footer={[
          <Button onClick={onCancel} key={1}>
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        <Flex style={{ marginBottom: 16 }} justify="end">
          <Button
            type="primary"
            className={cx("btn")}
            onClick={() => handleOpenCreateUpdateModal(-1)}
          >
            <PlusCircleOutlined />
            Thêm
          </Button>
        </Flex>
        <Table
          dataSource={data}
          rowKey={(record) => record.id}
          loading={isLoading}
          pagination={false}
        >
          <Column
            title="Id"
            dataIndex="id"
            key="id"
            sorter={(a: Blog, b: Blog) => {
              return a.id - b.id;
            }}
          />
          <Column title="Tên bài viết" dataIndex="title" key="title" />
          <Column
            title="Ngày tạo"
            dataIndex="createAt"
            key="createAt"
            render={(text) => day(text).format("DD/MM/YYYY")}
          />
          <Column
            title="Ngày chỉnh sửa"
            dataIndex="updateAt"
            key="updateAt"
            render={(text) => {
              if (text) {
                return day(text).format("DD/MM/YYYY");
              }
              return "Chưa cập nhật";
            }}
          />
          <Column
            title="Trạng thái"
            key="status"
            render={(_blog: Blog) => {
              return (
                <Switch
                  onClick={() =>
                    handleUpdateBlogStatus(
                      _blog.id,
                      _blog.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    )
                  }
                  checked={_blog.status === "ACTIVE" ? true : false}
                />
              );
            }}
          />
          <Column
            title="Thao tác"
            key="action"
            render={(_blog: Blog) => {
              return (
                <Button
                  type="primary"
                  className={cx("btn")}
                  onClick={() => handleOpenCreateUpdateModal(_blog.id)}
                >
                  <EditOutlined />
                  Chỉnh sửa
                </Button>
              );
            }}
          />
        </Table>
        {contextHolder}
      </Modal>
      <CreateUpdateBlog
        categoryId={blogCategoryId}
        blogId={currentBlogId}
        open={openModal}
        onCancel={handleCloseCreateUpdateModal}
        onFinish={fetcher}
      />
    </>
  );
};

export default BlogTableModal;
