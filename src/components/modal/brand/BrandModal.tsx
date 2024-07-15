import styles from "./Brand.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import { uploadImages } from "@/services/upload";
import { Brand, CreateBrandRequest, UpdateBrandRequest } from "@/types/brand";
import { createBrand, updateBrand } from "@/services/brand";

export enum BrandModalType {
  CREATE,
  EDIT,
}

interface IBrandModal {
  type: BrandModalType;
  value?: Brand | null;
  open: boolean;
  onCancel: () => void;
  onFinish: (message: string) => void;
}

const cx = classNames.bind(styles);

const BrandModal: React.FC<IBrandModal> = ({
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
  const [name, setName] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    switch (type) {
      case BrandModalType.CREATE: {
        setTitle("Thêm nhãn hàng");
        break;
      }
      case BrandModalType.EDIT: {
        setTitle("Chỉnh sửa nhãn hàng");
        break;
      }
    }
  }, [type]);

  useEffect(() => {
    if (value) {
      setImageUrl(value.image);
      setName(value.name);
    }
  }, [value]);

  const handleCancel = () => {
    setImageUrl("");
    setName("");
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
        case BrandModalType.CREATE: {
          if (image) {
            const imageRes = await uploadImages([image]);
            const request: CreateBrandRequest = {
              name,
              image: imageRes.paths[0],
            };
            const data = await createBrand(request);
            if (data) {
              handleCancel();
              handleFinish("Thêm nhãn hàng thành công");
            }
          }
          break;
        }
        case BrandModalType.EDIT: {
          if (value) {
            let isChanged = false;
            let editedImageUrl = value.image;
            if (image) {
              const imageRes = await uploadImages([image]);
              editedImageUrl = imageRes.paths[0];
              isChanged = true;
            }
            if (name !== value.name) {
              isChanged = true;
            }

            if (isChanged) {
              const request: UpdateBrandRequest = {
                id: value.id,
                name: name,
                image: editedImageUrl,
              };
              const data = await updateBrand(request);
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
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default BrandModal;
