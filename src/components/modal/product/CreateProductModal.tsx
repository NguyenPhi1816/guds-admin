"use client";

import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
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
  ExclamationCircleFilled,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  OptionValuesRequest,
  OptionValuesResponse,
  ValuesResponse,
} from "@/types/product";
import {
  createBaseProduct,
  createProductVariant,
} from "@/services/products-client";
import { createOptionValues } from "@/services/product";
import ImageUpload from "@/components/upload";

const { confirm } = Modal;
const { Title, Text } = Typography;

interface ICreateProductModal {
  open: boolean;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const DEFAULT_OPTION_NAME = "";
const DEFAULT_VALUE_NAME = "";

export type Variant = {
  id: number | null;
  image: File | null;
  imageUrl: string;
  quantity: number | undefined;
  price: number | undefined;
  optionValues: string[];
};

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
  const [variants, setVariants] = useState<Variant[]>([]);

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

  useEffect(() => {
    generateVariants();
  }, [option]);

  const handleCancel = () => {
    confirm({
      title: "Đóng cửa sổ thêm sản phẩm",
      icon: <ExclamationCircleFilled />,
      content:
        "Bạn có muốn đóng cửa không? Nếu có, dữ liệu trong cửa sổ sẽ biến mất",
      okText: "Đóng",
      okType: "danger",
      cancelText: "Không",
      onOk() {
        setName("");
        setDesc("");
        setCategoryIds([]);
        setBaseProductImages([]);
        setBrandId(undefined);
        setOption([]);
        setVariants([]);
        setValueArr([]);
        onCancel();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleCancelWithoutConfirm = () => {
    setName("");
    setDesc("");
    setCategoryIds([]);
    setBaseProductImages([]);
    setBrandId(undefined);
    setOption([]);
    setVariants([]);
    setValueArr([]);
    onCancel();
  };

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

  const generateCombinations = (options: OptionValuesRequest[]): string[][] => {
    const results: string[][] = [];
    const generate = (current: string[], depth: number) => {
      if (depth === options.length) {
        results.push(current);
        return;
      }
      for (const value of options[depth].values) {
        generate([...current, value], depth + 1);
      }
    };
    generate([], 0);
    return results;
  };

  const generateVariants = () => {
    const allCombinations = generateCombinations(option);
    const initialVariants: Variant[] = allCombinations.map((combination) => ({
      id: null,
      image: null,
      imageUrl: "",
      price: undefined,
      quantity: undefined,
      optionValues: combination,
    }));
    setVariants(initialVariants);
  };
  // End of Handle Option Values

  // Start of Handle Product Variant
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
  // End of Handle Product Variant

  const handleCreateProduct = async () => {
    await form.validateFields().then(async () => {
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
        const newBaseProduct = await createBaseProduct(
          createBaseProductRequest
        );
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
        const values: ValuesResponse[] = optionValuesResponse.reduce(
          (prev, curr) => [...prev, ...curr.values],
          [] as ValuesResponse[]
        );
        // End of Create Option Values
        // Create Product Variant
        const createProductVariantPromises = variants.map((variant, index) => {
          const _optionValueIds: number[] = [];
          for (let value of variant.optionValues) {
            const _myValue = values.find((v) => v.valueName === value);
            if (_myValue) {
              _optionValueIds.push(_myValue.valueId);
            }
          }
          const request: CreateProductVariantRequest = {
            baseProductId: newBaseProduct.id,
            image: variant.image as File,
            optionValueIds: _optionValueIds,
            price: variant.price ?? 0,
            quantity: variant.quantity ?? 0,
          };
          return createProductVariant(request);
        });
        const productVariants = await Promise.all(createProductVariantPromises);
        isValid = !!productVariants;
        if (!isValid) {
          throw new Error(
            "Có lỗi xảy ra trong quá trình thêm biến thể sản phẩm"
          );
        }
        // End of Create Product Variant
        handleCancelWithoutConfirm();
      }
    });
  };

  return (
    <Modal
      destroyOnClose={true}
      title={"Thêm sản phẩm"}
      open={open}
      onCancel={() => handleCancel()}
      footer={[]}
      className={cx("modal")}
      afterClose={() => form.resetFields()}
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
                  baseProductImages.length >= 2
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
          <Form.Item name="option-value" label="Tùy chọn - giá trị tùy chọn">
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
          {variants.map((variant, index) => {
            const valuesStr =
              variant.optionValues.length === 0
                ? "Mặc định"
                : variant.optionValues.join(", ");
            return (
              <Form.Item
                key={Math.random()}
                name={`variant-${index}`}
                label={`Tùy chọn: ${valuesStr}`}
                rules={[
                  {
                    required: true,
                    validator: (_, value) =>
                      variants[index] != null
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Vui lòng tải lên đủ 3 hình ảnh")
                          ),
                  },
                ]}
              >
                <Flex gap={16} align="center">
                  <ImageUpload
                    defaultValue={variant.imageUrl}
                    onChange={(file, url) => {
                      handleVariantChange(index, "image", file);
                      handleVariantChange(index, "imageUrl", url);
                    }}
                  />
                  <InputNumber
                    defaultValue={variant.price}
                    controls={false}
                    min={1000}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={{ flex: 3, height: "40px", padding: "4px 0" }}
                    onChange={(value) =>
                      handleVariantChange(index, "price", value)
                    }
                    placeholder="Giá sản phẩm"
                  />
                  <InputNumber
                    defaultValue={variant.quantity}
                    controls
                    min={0}
                    style={{ flex: 1, height: "40px", padding: "4px 0" }}
                    onChange={(value) =>
                      handleVariantChange(index, "quantity", value)
                    }
                    placeholder="Số lượng sản phẩm"
                  />
                </Flex>
                <Divider />
              </Form.Item>
            );
          })}
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
