import styles from "./Brand.module.scss";
import classNames from "classnames/bind";

import { Button, Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import ImageUpload from "@/components/upload/ImageUpload";
import { uploadImages } from "@/services/upload";
import { Brand, CreateBrandRequest, UpdateBrandRequest } from "@/types/brand";
import { createBrand, updateBrand } from "@/services/brand-client";

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
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    switch (type) {
      case BrandModalType.CREATE: {
        setTitle("Thêm nhãn hàng");
        form.resetFields();
        break;
      }
      case BrandModalType.EDIT: {
        setTitle("Chỉnh sửa nhãn hàng");
        break;
      }
    }
  }, [type, form]);

  useEffect(() => {
    if (value) {
      setImageUrl(value.image);
      form.setFieldsValue({
        brandName: value.name,
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
        case BrandModalType.CREATE: {
          if (image) {
            const request: CreateBrandRequest = {
              name: values.brandName,
              image: image,
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
            if (image) {
              isChanged = true;
            }
            if (values.brandName !== value.name) {
              isChanged = true;
            }

            if (isChanged) {
              const request: UpdateBrandRequest = {
                id: value.id,
                name: values.brandName,
                existImage: value.image,
                newImage: image,
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
      <Form
        form={form}
        name="AddBrand"
        layout="vertical"
        requiredMark="optional"
        className={cx("form")}
      >
        <Form.Item
          name="brandImage"
          rules={[
            {
              required: type === BrandModalType.CREATE,
              message: "Hình ảnh là bắt buộc",
            },
          ]}
        >
          <ImageUpload defaultValue={imageUrl} onChange={handleImageChange} />
        </Form.Item>
        <Form.Item
          name="brandName"
          rules={[{ required: true, message: "Tên nhãn hàng là bắt buộc" }]}
        >
          <Input placeholder="Tên nhãn hàng" size="large" />
        </Form.Item>
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default BrandModal;
