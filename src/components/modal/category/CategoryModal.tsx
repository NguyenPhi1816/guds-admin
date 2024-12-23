import styles from "./CategoryModel.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import {
  AddCategoryRequest,
  CategoryResponse,
  EditCategoryRequest,
} from "@/types/category";
import TextArea from "antd/es/input/TextArea";
import { addCategory, editCategory } from "@/services/category-client";

const { Text } = Typography;

export enum CategoryModalType {
  CREATE,
  EDIT,
}

interface IAddCategoryModal {
  type: CategoryModalType;
  value?: CategoryResponse | null;
  open: boolean;
  categories: CategoryResponse[];
  onCancel: () => void;
  onFinish: (message: string) => void;
}

const cx = classNames.bind(styles);

const AddCategoryModal: React.FC<IAddCategoryModal> = ({
  type,
  value,
  open,
  categories,
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
      case CategoryModalType.CREATE: {
        setTitle("Thêm danh mục");
        form.resetFields();
        break;
      }
      case CategoryModalType.EDIT: {
        setTitle("Chỉnh sửa danh mục");
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
        categoryParent: value.parent ? value.parent.id : -1,
      });
    }
  }, [value, form]);

  const handleParentChange = (value: number) => {
    form.setFieldsValue({ categoryParent: value });
  };

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
        case CategoryModalType.CREATE: {
          if (image) {
            const myParentId =
              values.categoryParent === -1 ? null : values.categoryParent;
            const request: AddCategoryRequest = {
              name: values.categoryName,
              image: image,
              description: values.categoryDesc,
              parentId: myParentId,
            };
            const data = await addCategory(request);
            if (data) {
              handleCancel();
              handleFinish("Tạo danh mục thành công");
            }
          }
          break;
        }
        case CategoryModalType.EDIT: {
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
            if (value.parent && values.categoryParent !== value.parent.id) {
              isChanged = true;
            } else if (
              !value.parent &&
              values.categoryParent !== value.parent
            ) {
              isChanged = true;
            }

            if (isChanged) {
              const myParentId =
                values.categoryParent === -1 ? null : values.categoryParent;
              const request: EditCategoryRequest = {
                id: value.id,
                name: values.categoryName,
                existImage: value.image,
                existImageId: value.imageId,
                newImage: image,
                description: values.categoryDesc,
                parentId: myParentId,
              };
              const data = await editCategory(request);
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
              required: type === CategoryModalType.CREATE,
              message: "Hình ảnh là bắt buộc",
            },
          ]}
        >
          <ImageUpload defaultValue={imageUrl} onChange={handleImageChange} />
        </Form.Item>
        <Form.Item
          name="categoryName"
          label="Tên danh mục"
          rules={[{ required: true, message: "Tên danh mục là bắt buộc" }]}
        >
          <Input placeholder="Tên danh mục" size="large" />
        </Form.Item>
        <Form.Item
          name="categoryDesc"
          label="Mô tả"
          rules={[{ required: true, message: "Mô tả là bắt buộc" }]}
        >
          <TextArea rows={4} placeholder="Mô tả" size="large" />
        </Form.Item>
        <Form.Item label="Danh mục cha" initialValue={-1} name="categoryParent">
          <Select
            size="large"
            onChange={handleParentChange}
            showSearch
            placeholder="Tìm kiếm danh mục"
            filterOption={(input, option) =>
              ((option?.children || "") as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            <Select.Option value={-1}>Không</Select.Option>
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default AddCategoryModal;
