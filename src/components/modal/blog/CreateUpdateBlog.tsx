import styles from "./Blog.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, message, Modal, Typography } from "antd";
import React, { useEffect, useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import TextArea from "antd/es/input/TextArea";
import {
  Blog,
  BlogCategory,
  BlogDetail,
  CreateBlog,
  CreateBlogCategory,
  UpdateBlog,
  UpdateBlogCategory,
} from "@/types/blog";
import {
  createBlog,
  createBlogCategory,
  updateBlog,
  updateBlogCategory,
} from "@/services/blog-client";
import { getBlogDetail } from "@/services/blog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import blog from ".";

interface IAddCategoryModal {
  blogId?: number;
  categoryId: number;
  open: boolean;
  onCancel: () => void;
  onFinish: (message: string) => void;
}

const cx = classNames.bind(styles);

const CreateUpdateBlog: React.FC<IAddCategoryModal> = ({
  blogId = -1,
  categoryId,
  open,
  onCancel,
  onFinish,
}) => {
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [content, setContent] = useState<string>("");
  const [data, setData] = useState<BlogDetail | null>(null);

  useEffect(() => {
    switch (blogId) {
      case -1: {
        setTitle("Thêm bài viết");
        form.resetFields();
        break;
      }
      default: {
        setTitle("Chỉnh sửa bài viết");
        break;
      }
    }
  }, [blogId, form]);

  useEffect(() => {
    async function fetcher() {
      if (blogId != -1) {
        const blogDetail = await getBlogDetail(blogId);
        setImageUrl(blogDetail.image);
        setData(blogDetail);
        form.setFieldsValue({
          title: blogDetail.title,
          summary: blogDetail.summary,
          content: blogDetail.content,
        });
      }
    }

    fetcher();
  }, [blogId, form]);

  const handleCancel = () => {
    form.resetFields();
    setImage(null);
    setImageUrl(null);
    onCancel();
  };

  const handleFinish = (message: string) => {
    onFinish(message);
  };

  const handleImageChange = (file: File) => {
    setImage(file);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      switch (blogId) {
        case -1: {
          if (image) {
            const request: CreateBlog = {
              title: values.title,
              summary: values.summary,
              content: content,
              image: image,
              categoryId: categoryId,
            };
            const data = await createBlog(request);
            if (data) {
              handleCancel();
              handleFinish("Tạo bài viết thành công");
            }
          }
          break;
        }
        default: {
          if (data) {
            let isChanged = false;
            if (image) {
              isChanged = true;
            }
            if (
              values.title !== data.title ||
              values.summary !== data.summary ||
              content !== data.content
            ) {
              isChanged = true;
            }
            if (isChanged) {
              const request: UpdateBlog = {
                id: data.id,
                title: values.title,
                summary: values.summary,
                content: content,
                existImage: data.image,
                existImageId: data.imageId,
                newImage: image,
                categoryId: categoryId,
              };
              const result = await updateBlog(request);
              if (result) {
                handleCancel();
                handleFinish("Đã lưu thay đổi");
              }
            }
          }
          break;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      destroyOnClose={true}
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button onClick={handleCancel} key={1}>
          Hủy
        </Button>,
        <Button
          onClick={handleSubmit}
          className={cx("btn")}
          type="primary"
          key={2}
          loading={loading}
        >
          {title}
        </Button>,
      ]}
    >
      <Form
        form={form}
        name="category"
        layout="vertical"
        requiredMark="optional"
        className={cx("form")}
      >
        <Form.Item
          name="image"
          rules={[
            {
              required: blogId === -1,
              message: "Hình ảnh là bắt buộc",
            },
          ]}
        >
          <ImageUpload defaultValue={imageUrl} onChange={handleImageChange} />
        </Form.Item>
        <Form.Item
          name="title"
          label="Tên bài viết"
          rules={[{ required: true, message: "Tên bài viết là bắt buộc" }]}
        >
          <Input placeholder="Nhập tên bài viết" size="large" />
        </Form.Item>
        <Form.Item
          name="summary"
          label="Tóm tắt bài viết"
          rules={[{ required: true, message: "Tóm tắt bài viết là bắt buộc" }]}
        >
          <Input placeholder="Nhập tóm tắt bài viết" size="large" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Nội dung bài viết"
          rules={[{ required: true, message: "Vui lòng nội dung bài viết" }]}
        >
          <ReactQuill
            className={cx("quill")}
            theme="snow"
            placeholder="Vui lòng nhập nội dung bài viết"
            onChange={(value) => setContent(value)}
          />
        </Form.Item>
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default CreateUpdateBlog;
