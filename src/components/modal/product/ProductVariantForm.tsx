import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import ImageUpload from "@/components/upload/ImageUpload";
import { Divider, Flex, Form, InputNumber, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

export type Variant = {
  id: number | null;
  image: File | null;
  imageUrl: string;
  quantity: number;
  price: number;
  optionValues: string[];
};

interface IProductVariantForm {
  defaultValue: Variant[];
  onChange: (variants: Variant[]) => void;
}

const cx = classNames.bind(styles);

const ProductVariantForm: React.FC<IProductVariantForm> = ({
  defaultValue,
  onChange,
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    setVariants(defaultValue);
  }, [defaultValue]);

  const handleVariantChange = (
    index: number,
    key: keyof Variant,
    value: any
  ) => {
    setVariants((prev) => {
      prev[index] = { ...prev[index], [key]: value };
      onChange(prev);
      return prev;
    });
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
                  onChange={(file) => handleVariantChange(index, "image", file)}
                />
                <Space direction="vertical">
                  <Form.Item name="price" label="Giá" className={cx("m-0")}>
                    <InputNumber
                      controls={false}
                      min={1000}
                      defaultValue={1000}
                      formatter={(value) =>
                        `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
