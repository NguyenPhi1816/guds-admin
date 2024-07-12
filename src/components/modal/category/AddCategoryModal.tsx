import styles from "./AddCategoryModel.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, Modal, Select } from "antd";
import React, { useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import { AddCategoryRequest, CategoryResponse } from "@/types/category";
import { addCategory } from "@/services/category";

interface IAddCategoryModal {
  open: boolean;
  categories: CategoryResponse[];
  onCancel: () => void;
  onFinish: () => void;
}

const cx = classNames.bind(styles);

const AddCategoryModal: React.FC<IAddCategoryModal> = ({
  open,
  categories,
  onCancel,
  onFinish,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [parentId, setParentId] = useState<number | null>(null);

  const handleImageChange = (url: string) => {
    setImageUrl(url);
  };

  const handleParentChange = (value: number) => {
    if (value !== -1) {
      setParentId(value);
    }
  };

  const handleCancel = () => {
    setImageUrl(null);
    setName("");
    setDesc("");
    setParentId(null);
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      if (imageUrl) {
        setLoading(true);
        const request: AddCategoryRequest = {
          name,
          image: imageUrl,
          description: desc,
          parentId,
        };
        const data = await addCategory(request);
        if (data) {
          handleCancel();
          onFinish();
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm danh mục"
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
          Thêm danh mục
        </Button>,
      ]}
    >
      <div className={cx("image-wrapper")}>
        <ImageUpload onChange={handleImageChange} />
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>
        <Form.Item name="categoryDesc">
          <Input
            placeholder="Mô tả"
            size="large"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </Form.Item>
        <Form.Item name="categoryParent">
          <Select defaultValue={-1} onChange={handleParentChange}>
            <Select.Option value={-1}>Không</Select.Option>
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
