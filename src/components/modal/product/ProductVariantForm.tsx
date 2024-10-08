import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import ImageUpload from "@/components/upload/ImageUpload";
import {
  Button,
  Divider,
  Flex,
  Form,
  InputNumber,
  message,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

export enum ProductVariantFormType {
  UPDATE,
  CREATE,
}

export type Variant = {
  id: number | null;
  image: File | null;
  imageUrl: string;
  quantity: number;
  price: number;
  optionValues: string[];
};

interface IProductVariantForm {
  type?: ProductVariantFormType;
  defaultValue?: Variant[];
  onSubmit: (variants: Variant[]) => void;
  onCancel: () => void;
  onGoBack: () => void;
}

const cx = classNames.bind(styles);

const ProductVariantForm: React.FC<IProductVariantForm> = ({
  type = ProductVariantFormType.CREATE,
  defaultValue = undefined,
  onSubmit,
  onCancel,
  onGoBack,
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    if (defaultValue) {
      setVariants(defaultValue);
    }
  }, [defaultValue]);

  const handleVariantChange = (
    index: number,
    key: keyof Variant,
    value: any
  ) => {
    setVariants((prev) => {
      prev[index] = { ...prev[index], [key]: value };
      return prev;
    });
  };

  const handleSubmit = () => {
    const isValidate = variants.reduce(
      (prev, curr) => prev && !!curr.image,
      true
    );
    if (type === ProductVariantFormType.CREATE && !isValidate) {
      return message.error("Vui lòng nhập đầy đủ thông tin");
    }
    onSubmit(variants);
  };

  return (
    <>
      <Flex align="center" className={cx("header")}>
        <Title level={5} className={cx("m-0")}>
          Biến thể
        </Title>
      </Flex>
      {variants.map((variant, index) => {
        const valuesStr =
          variant.optionValues.length === 0
            ? "Mặc định"
            : variant.optionValues.join(", ");
        return (
          <div key={Math.random()}>
            <Text>Tùy chọn: {valuesStr}</Text>
            <Form
              layout="vertical"
              title={valuesStr}
              fields={[
                { name: "price", value: variant.price },
                { name: "quantity", value: variant.quantity },
              ]}
            >
              <Space align="end">
                <ImageUpload
                  defaultValue={variant.imageUrl}
                  onChange={(file, url) => {
                    handleVariantChange(index, "image", file);
                    handleVariantChange(index, "imageUrl", url as string);
                  }}
                />
                <Space direction="vertical">
                  <Form.Item name="price" label="Giá" className={cx("m-0")}>
                    <InputNumber
                      controls={false}
                      min={1000}
                      prefix="₫"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        handleVariantChange(index, "price", value)
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="quantity"
                    label="Số lượng"
                    className={cx("m-0")}
                  >
                    <InputNumber
                      controls
                      defaultValue={1}
                      min={0}
                      onChange={(value) =>
                        handleVariantChange(index, "quantity", value)
                      }
                    />
                  </Form.Item>
                </Space>
              </Space>
            </Form>
            <Divider />
          </div>
        );
      })}
    </>
  );
};

export default ProductVariantForm;
