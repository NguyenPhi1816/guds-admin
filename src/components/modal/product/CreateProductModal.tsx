"use client";

import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

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
  Tag,
  Upload,
  UploadFile,
} from "antd";
import React, { useEffect, useState } from "react";
import { getAllCategory } from "@/services/category";
import { getAllBrand } from "@/services/brand";
import { CategoryResponse } from "@/types/category";
import { Brand } from "@/types/brand";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  OptionValuesRequest,
  OptionValuesResponse,
} from "@/types/product";
import { createBaseProduct } from "@/services/products-client";
import { createOptionValues } from "@/services/product";

const { confirm } = Modal;

interface ICreateProductModal {
  open: boolean;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const DEFAULT_OPTION_NAME = "";
const DEFAULT_VALUE_NAME = "";

const CreateProductModal: React.FC<ICreateProductModal> = ({
  open,
  onCancel,
}) => {
  const disable = false;
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [form] = Form.useForm();
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [baseProductImages, setBaseProductImages] = useState<
    UploadFile<File>[]
  >([]);
  const [option, setOption] = useState<OptionValuesRequest[]>([]);
  const [valueArr, setValueArr] = useState<string[]>([]);

  // Load categories and brands from database
  useEffect(() => {
    const fetcher = async () => {
      const promises = [getAllCategory(), getAllBrand()];
      const [_categories, _brands] = await Promise.all(promises);
      setCategories(_categories as CategoryResponse[]);
      setBrands(_brands as Brand[]);
    };
    fetcher();
  }, []);

  const handleCancel = () => {};

  // Handle Option Values
  const handleCreateOption = () => {
    const defaultOptionExists = option.some(
      (item) => item.option === DEFAULT_OPTION_NAME
    );
    if (defaultOptionExists) {
      message.error("Vui lòng nhập tùy chọn trước khi thêm tùy chọn mới");
      return;
    }
    setOption((prev) => {
      const newItem: OptionValuesRequest = {
        option: DEFAULT_OPTION_NAME,
        values: [],
      };
      return [...prev, newItem];
    });
    setValueArr((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (optionName: string) => {
    setOption((prev) => {
      return prev.filter((item) => item.option !== optionName);
    });
  };

  const handleCreateValue = (optionIndex: number, newValue: string) => {
    setOption((prev) => {
      const newOptions = [...prev];
      const values = newOptions[optionIndex].values;
      if (values.includes(newValue)) {
        return prev;
      } else {
        newOptions[optionIndex].values = [...values, newValue];
        return newOptions;
      }
    });
    setValueArr((prev) => {
      const newValueArr = [...prev];
      newValueArr[optionIndex] = "";
      return newValueArr;
    });
  };

  const handleRemoveValue = (optionName: string, optionValue: string) => {
    setOption((prev) => {
      return prev.map((item) =>
        item.option === optionName
          ? {
              ...item,
              values: item.values.filter((value) => value !== optionValue),
            }
          : item
      );
    });
  };

  const handleOptionNameChange = (index: number, value: string) => {
    setOption((prev) => {
      const newOptions = [...prev];
      newOptions[index] = { ...newOptions[index], option: value };
      return newOptions;
    });
  };

  // End of Handle Option Values

  const handleCreateProduct = async () => {
    if (brandId) {
      let isValid = true;
      // Create Base Product
      // Extract Files
      const files: File[] = baseProductImages
        .filter((file) => !!file.originFileObj)
        .map((file) => file.originFileObj as File);
      const createBaseProductRequest: CreateBaseProductRequest = {
        name: name,
        description: desc,
        categoryIds: categoryIds,
        brandId: brandId,
        images: files,
      };
      const newBaseProduct = await createBaseProduct(createBaseProductRequest);
      isValid = !!newBaseProduct;
      if (!isValid) {
        throw new Error("Có lỗi xảy ra trong quá trình thêm sản phẩm");
      }
      // End of Create Base Product

      // Create Option Values
      const createOptionValuesRequest: CreateOptionValueRequest = {
        baseProductId: newBaseProduct.id,
        optionValues: option,
      };

      const optionValuesResponse: OptionValuesResponse[] =
        await createOptionValues(createOptionValuesRequest);
      isValid = !!optionValuesResponse;
      if (!isValid) {
        throw new Error(
          "Có lỗi xảy ra trong quá trình thêm tùy chọn cho sản phẩm"
        );
      }
      // End of Create Option Values
    }
  };

  return (
    <Modal
      destroyOnClose={true}
      title={"Thêm sản phẩm"}
      open={open}
      onCancel={() => handleCancel()}
      footer={[]}
      className={cx("modal")}
    >
      <Flex vertical>
        <Form
          form={form}
          name="CreateCategory"
          layout="vertical"
          requiredMark="optional"
          className={cx("form")}
        >
          <Form.Item
            name="images"
            label="Hình ảnh"
            rules={[
              {
                required: true,
                validator: (_, value) =>
                  baseProductImages.filter((img) => img).length >= 3
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Vui lòng tải lên đủ 3 hình ảnh")
                      ),
              },
            ]}
          >
            <Space>
              <Upload
                listType="picture"
                beforeUpload={() => false}
                defaultFileList={baseProductImages}
                onChange={({ fileList }) => setBaseProductImages(fileList)}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  Tải hình ảnh lên
                </Button>
              </Upload>
            </Space>
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input
              placeholder="Tên sản phẩm"
              size="large"
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Item>
          <Flex gap={16}>
            <Form.Item
              name="category"
              label="Danh mục sản phẩm"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select
                size="large"
                mode="multiple"
                allowClear
                placeholder="Vui lòng chọn danh mục"
                onChange={(value) => {
                  setCategoryIds(value);
                }}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="brand"
              label="Nhãn hàng"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: "Vui lòng chọn nhãn hàng" },
                {
                  validator: (_, value) => {
                    if (value === -1) {
                      return Promise.reject(
                        new Error("Vui lòng chọn một nhãn hàng hợp lệ")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Vui lòng chọn nhãn hàng"
                onChange={(value) => setBrandId(value)}
              >
                <Select.Option value={-1} disabled>
                  Chọn một nhãn hàng
                </Select.Option>
                {brands.map((brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Flex>
          <Form.Item
            name="option-value"
            label="Tùy chọn - giá trị tùy chọn"
            rules={[{ required: true, message: "Vui lòng chọn nhãn hàng" }]}
          >
            <Flex vertical>
              <Space direction="vertical">
                {option.length > 0 &&
                  option.map((item, optionIndex) => (
                    <div key={optionIndex}>
                      <Flex gap={16} align="center">
                        <Input
                          style={{ flex: 1 }}
                          disabled={disable}
                          placeholder="Vui lòng nhập tùy chọn"
                          size="large"
                          defaultValue={item.option}
                          onBlur={(e) =>
                            handleOptionNameChange(optionIndex, e.target.value)
                          }
                        />
                        <Flex className={cx("tags-input")} align="center">
                          {item.values.map((value, valueIndex) => (
                            <Tag
                              key={valueIndex}
                              closeIcon
                              onClose={() =>
                                handleRemoveValue(item.option, value)
                              }
                              style={{ height: "fit-content" }}
                            >
                              {value}
                            </Tag>
                          ))}
                          <Input
                            variant="borderless"
                            className="borderless-tags-input"
                            disabled={disable}
                            placeholder="Vui lòng nhập giá trị"
                            size="large"
                            value={valueArr[optionIndex]}
                            onChange={(e) =>
                              setValueArr((prev) => {
                                const newValueArr = [...prev];
                                newValueArr[optionIndex] =
                                  e.currentTarget.value;
                                return newValueArr;
                              })
                            }
                            onPressEnter={(e) => {
                              handleCreateValue(
                                optionIndex,
                                e.currentTarget.value
                              );
                            }}
                          />
                        </Flex>
                        <Button
                          disabled={disable}
                          shape="circle"
                          onClick={() => handleRemoveOption(item.option)}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Flex>
                      <Divider />
                    </div>
                  ))}
              </Space>
              <Button
                disabled={disable}
                onClick={handleCreateOption}
                style={{ width: "fit-content" }}
              >
                <PlusCircleOutlined />
                Thêm tùy chọn
              </Button>
            </Flex>
          </Form.Item>
          <Form.Item
            name="desc"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <ReactQuill
              className={cx("quill")}
              theme="snow"
              placeholder="Vui lòng nhập mô tả"
              onChange={(value) => setDesc(value)}
            />
          </Form.Item>
        </Form>
        <Flex justify="end">
          <Space>
            <Button onClick={handleCancel} danger>
              Hủy
            </Button>
            <Button onClick={handleCreateProduct} type="primary">
              Tạo sản phẩm
            </Button>
          </Space>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default CreateProductModal;
