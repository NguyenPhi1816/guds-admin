import styles from "./CategoryModel.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, message, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import {
  AddCategoryRequest,
  CategoryResponse,
  EditCategoryRequest,
} from "@/types/category";
import { addCategory, editCategory } from "@/services/category";
import { uploadImages } from "@/services/upload";
import TextArea from "antd/es/input/TextArea";

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
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [parentId, setParentId] = useState<number>(-1);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    switch (type) {
      case CategoryModalType.CREATE: {
        setTitle("Thêm danh mục");
        break;
      }
      case CategoryModalType.EDIT: {
        setTitle("Chỉnh sửa danh mục");
        break;
      }
    }
  }, [type]);

  useEffect(() => {
    if (value) {
      setImageUrl(value.image);
      setName(value.name);
      setDesc(value.description);
      if (value.parent) {
        setParentId(value.parent.id);
      } else {
        setParentId(-1);
      }
    }
  }, [value]);

  const handleParentChange = (value: number) => {
    if (value !== -1) {
      setParentId(value);
    }
  };

  const handleCancel = () => {
    setImageUrl("");
    setName("");
    setDesc("");
    setParentId(-1);
    setImage(null);
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
      setLoading(true);
      switch (type) {
        case CategoryModalType.CREATE: {
          if (image) {
            const imageRes = await uploadImages([image]);
            const myParentId = parentId === -1 ? null : parentId;
            const request: AddCategoryRequest = {
              name,
              image: imageRes.paths[0],
              description: desc,
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
            let editedImageUrl = value.image;
            if (image) {
              const imageRes = await uploadImages([image]);
              editedImageUrl = imageRes.paths[0];
              isChanged = true;
            }
            if (name !== value.name || desc !== value.description) {
              isChanged = true;
            }
            if (value.parent && parentId !== value.parent.id) {
              isChanged = true;
            } else if (!value.parent && parentId !== value.parent) {
              isChanged = true;
            }

            if (isChanged) {
              const myParentId = parentId === -1 ? null : parentId;
              const request: EditCategoryRequest = {
                id: value.id,
                name: name,
                image: editedImageUrl,
                description: desc,
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
      <div className={cx("image-wrapper")}>
        <ImageUpload defaultValue={imageUrl} onChange={handleImageChange} />
      </div>
      <Form
        name="AddCategory"
        layout="vertical"
        requiredMark="optional"
        className={cx("form")}
      >
        <Form.Item name="categoryName">
          <Input
            placeholder="Tên danh mục"
            size="large"
            defaultValue={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>
        <Form.Item name="categoryDesc">
          <TextArea
            rows={4}
            placeholder="Mô tả"
            size="large"
            defaultValue={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </Form.Item>
        <Form.Item name="categoryParent">
          <Select defaultValue={parentId} onChange={handleParentChange}>
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
