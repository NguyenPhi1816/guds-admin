import styles from "./Blog.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, message, Modal, Typography } from "antd";
import React, { useEffect, useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import TextArea from "antd/es/input/TextArea";
import {
  BlogCategory,
  CreateBlogCategory,
  UpdateBlogCategory,
} from "@/types/blog";
import { createBlogCategory, updateBlogCategory } from "@/services/blog-client";

interface IAddCategoryModal {
  type: "CREATE" | "UPDATE";
  value?: BlogCategory | null;
  open: boolean;
  onCancel: () => void;
  onFinish: (message: string) => void;
}

const cx = classNames.bind(styles);

const CreateUpdateBlogCategory: React.FC<IAddCategoryModal> = ({
  type,
  value,
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

  useEffect(() => {
    switch (type) {
      case "CREATE": {
        setTitle("Thêm danh mục bài viết");
        form.resetFields();
        break;
      }
      case "UPDATE": {
        setTitle("Chỉnh sửa danh mục bài viết");
        break;
      }
    }
  }, [type, form]);

  useEffect(() => {
    if (value) {
      setImageUrl(value.image);
      form.setFieldsValue({
        categoryName: value.name,
        categoryDesc: value.description,
      });
    }
  }, [value, form]);

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
      switch (type) {
        case "CREATE": {
          if (image) {
            const request: CreateBlogCategory = {
              name: values.categoryName,
              image: image,
              description: values.categoryDesc,
            };
            const data = await createBlogCategory(request);
            if (data) {
              handleCancel();
              handleFinish("Tạo danh mục bài viết thành công");
            }
          }
          break;
        }
        case "UPDATE": {
          if (value) {
            let isChanged = false;
            if (image) {
              isChanged = true;
            }
            if (
              values.categoryName !== value.name ||
              values.categoryDesc !== value.description
            ) {
              isChanged = true;
            }

            if (isChanged) {
              const request: UpdateBlogCategory = {
                id: value.id,
                name: values.categoryName,
                existImage: value.image,
                existImageId: value.imageId,
                newImage: image,
                description: values.categoryDesc,
              };
              const data = await updateBlogCategory(request);
              if (data) {
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
          name="categoryImage"
          rules={[
            {
              required: type === "CREATE",
              message: "Hình ảnh là bắt buộc",
            },
          ]}
        >
          <ImageUpload defaultValue={imageUrl} onChange={handleImageChange} />
        </Form.Item>
        <Form.Item
          name="categoryName"
          label="Tên danh mục bài viết"
          rules={[
            { required: true, message: "Tên danh mục bài viết là bắt buộc" },
          ]}
        >
          <Input placeholder="Nhập tên danh mục bài viết" size="large" />
        </Form.Item>
        <Form.Item
          name="categoryDesc"
          label="Mô tả"
          rules={[{ required: true, message: "Mô tả là bắt buộc" }]}
        >
          <TextArea rows={4} placeholder="Mô tả" size="large" />
        </Form.Item>
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default CreateUpdateBlogCategory;
