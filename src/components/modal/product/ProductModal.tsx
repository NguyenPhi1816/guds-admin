import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import ImageUpload from "@/components/upload/ImageUpload";
import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { CategoryResponse } from "@/types/category";
import { Brand } from "@/types/brand";
import { getAllCategory } from "@/services/category";
import { getAllBrand } from "@/services/brand";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";

export enum ProductModalType {
  CREATE,
  UPDATE,
}

export type Option = {
  name: string;
  values: string[];
};

interface IProductModal {
  type: ProductModalType;
  open: boolean;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const { Text } = Typography;

const ProductModal: React.FC<IProductModal> = ({ type, open, onCancel }) => {
  const DEFAULT_OPTION_NAME = "Tùy chọn mới";
  const DEFAULT_VALUE_NAME = "Giá trị mới";

  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [option, setOption] = useState<Option[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      const promises = [getAllCategory(), getAllBrand()];
      const [_categories, _brands] = await Promise.all(promises);
      setCategories(_categories as CategoryResponse[]);
      setBrands(_brands as Brand[]);
    };
    fetcher();
  }, []);

  useEffect(() => {
    switch (type) {
      case ProductModalType.CREATE: {
        setTitle("Thêm sản phẩm");
        break;
      }
      case ProductModalType.UPDATE: {
        setTitle("Chỉnh sửa sản phẩm");
        break;
      }
    }
  }, [type]);

  const handleCancel = () => {
    setImages([null, null, null]);
    onCancel();
  };

  const handleImageChange = (index: number, file: File) => {
    setImages((prev) => {
      const newValue = prev;
      newValue[index] = file;
      return newValue;
    });
  };

  const handleCreateOption = () => {
    const defaultOptionExists = option.some(
      (item) => item.name === DEFAULT_OPTION_NAME
    );
    if (defaultOptionExists) {
      messageApi.error("Vui lòng nhập tùy chọn trước khi thêm tùy chọn mới");
      return;
    }
    setOption((prev) => {
      const newItem: Option = {
        name: DEFAULT_OPTION_NAME,
        values: [DEFAULT_VALUE_NAME],
      };
      return [...prev, newItem];
    });
  };

  const handleRemoveOption = (optionName: string) => {
    setOption((prev) => prev.filter((item) => item.name !== optionName));
  };

  const handleCreateValue = (optionName: string) => {
    const defaultValueExists = option.some(
      (item) =>
        item.name === optionName && item.values.includes(DEFAULT_VALUE_NAME)
    );
    if (defaultValueExists) {
      messageApi.error("Vui lòng nhập giá trị trước khi thêm giá trị mới");
      return;
    }
    setOption((prev) =>
      prev.map((item) =>
        item.name === optionName
          ? { ...item, values: [...item.values, DEFAULT_VALUE_NAME] }
          : item
      )
    );
  };

  const handleRemoveValue = (optionName: string, optionValue: string) => {
    setOption((prev) =>
      prev.map((item) =>
        item.name === optionName
          ? {
              ...item,
              values: item.values.filter((value) => value !== optionValue),
            }
          : item
      )
    );
  };

  const handleOptionNameChange = (index: number, value: string) => {
    setOption((prev) => {
      const newOptions = [...prev];
      newOptions[index] = { ...newOptions[index], name: value };
      return newOptions;
    });
  };

  const handleOptionValueChange = (
    optionIndex: number,
    valueIndex: number,
    value: string
  ) => {
    setOption((prev) => {
      const newOptions = [...prev];
      newOptions[optionIndex].values[valueIndex] = value;
      return newOptions;
    });
  };

  const handleSubmit = () => {
    console.log(option);
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
      width={"90%"}
      className={cx("modal")}
    >
      <Flex>
        <div className={cx("form-wrapper")}>
          <Form
            name="AddCategory"
            layout="vertical"
            requiredMark="optional"
            className={cx("form")}
          >
            <Form.Item name="images" label="Hình ảnh">
              <Space>
                {new Array(3).fill(0).map((item, index) => (
                  <ImageUpload
                    key={index}
                    defaultValue={imageUrls[index]}
                    onChange={(file) => handleImageChange(index, file)}
                  />
                ))}
              </Space>
            </Form.Item>
            <Form.Item name="name" label="Tên sản phẩm">
              <Input
                placeholder="Tên sản phẩm"
                size="large"
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Item>
            <Form.Item name="category" label="Danh mục sản phẩm">
              <Select
                mode="multiple"
                allowClear
                placeholder="Vui lòng chọn danh mục"
                // onChange={handleParentChange}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="brand" label="Nhãn hàng">
              <Select
                defaultValue={-1}
                // onChange={handleParentChange}
              >
                <Select.Option value={-1}>Không</Select.Option>
                {brands.map((brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="desc" label="Mô tả">
              <ReactQuill
                className={cx("quill")}
                theme="snow"
                value={desc}
                onChange={setDesc}
              />
            </Form.Item>
          </Form>
        </div>
        <div className={cx("form-wrapper")}>
          <Flex
            className={cx("option-header")}
            justify="space-between"
            align="center"
          >
            <Text>Tùy chọn</Text>
            <Button onClick={handleCreateOption}>
              <PlusCircleOutlined />
              Thêm tùy chọn
            </Button>
          </Flex>
          <Space direction="vertical">
            {option.length > 0 &&
              option.map((item, optionIndex) => (
                <div key={optionIndex}>
                  <Space>
                    <Space>
                      <Input
                        placeholder="Tùy chọn"
                        size="large"
                        defaultValue={item.name}
                        onChange={(e) =>
                          handleOptionNameChange(optionIndex, e.target.value)
                        }
                      />
                      <Button
                        shape="circle"
                        onClick={() => handleRemoveOption(item.name)}
                      >
                        <MinusCircleOutlined />
                      </Button>
                    </Space>
                    <Space>
                      <Space direction="vertical">
                        {item.values.map((value, valueIndex) => (
                          <Space>
                            <Input
                              key={valueIndex}
                              placeholder="Giá trị"
                              size="large"
                              defaultValue={value}
                              onChange={(e) =>
                                handleOptionValueChange(
                                  optionIndex,
                                  valueIndex,
                                  e.target.value
                                )
                              }
                            />
                            <Button
                              shape="circle"
                              onClick={() =>
                                handleRemoveValue(item.name, value)
                              }
                            >
                              <MinusCircleOutlined />
                            </Button>
                          </Space>
                        ))}
                      </Space>
                      <Button
                        shape="circle"
                        onClick={() => handleCreateValue(item.name)}
                      >
                        <PlusCircleOutlined />
                      </Button>
                    </Space>
                  </Space>
                  <Divider />
                </div>
              ))}
          </Space>
        </div>
      </Flex>
      {contextHolder}
    </Modal>
  );
};

export default ProductModal;
