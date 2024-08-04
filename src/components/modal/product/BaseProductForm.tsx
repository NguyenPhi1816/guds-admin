import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";
import { Button, Flex, Form, Input, Select, Space } from "antd";
import ImageUpload from "@/components/upload/ImageUpload";
import React, { useEffect, useState } from "react";
import { CategoryResponse } from "@/types/category";
import { Brand } from "@/types/brand";
import { getAllCategory } from "@/services/category";
import { getAllBrand } from "@/services/brand";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CreateBaseProductRequest } from "@/types/product";

export enum BaseProductFormType {
  UPDATE,
  CREATE,
}

interface IBaseProductForm {
  type?: BaseProductFormType;
  value?: CreateBaseProductRequest;
  imageFiles?: File[];
  onCancel: () => void;
  onSubmit: (baseProduct: CreateBaseProductRequest, images: File[]) => void;
}

const cx = classNames.bind(styles);

const BaseProductForm: React.FC<IBaseProductForm> = ({
  type = BaseProductFormType.CREATE,
  value = undefined,
  imageFiles = undefined,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const INITIAL_IMAGES = [null, null, null];

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [images, setImages] = useState<(File | null)[]>(INITIAL_IMAGES);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brandId, setBrandId] = useState<number | undefined>(undefined);

  // Get categories and brands
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
    if (value && imageFiles) {
      setName(value.name);
      setDesc(value.description);
      setCategoryIds(value.categoryIds);
      setBrandId(value.brandId);
      setImageUrls(value.images);
      setImages(imageFiles);

      form.setFieldsValue({
        name: value.name,
        desc: value.description,
        category: value.categoryIds,
        brand: value.brandId,
        images: imageFiles,
      });
    }
  }, [value, imageFiles]);

  const handleImageChange = (index: number, file: File) => {
    setImages((prev) => {
      const newValue = [...prev];
      newValue[index] = file;
      return newValue;
    });
  };

  const handleImageUrlChange = (index: number, url: string) => {
    setImageUrls((prev) => {
      const newValue = [...prev];
      newValue[index] = url;
      return newValue;
    });
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const baseProduct: CreateBaseProductRequest = {
          name: values.name,
          description: values.desc,
          categoryIds: values.category,
          brandId: values.brand,
          images: imageUrls,
        };
        onSubmit(baseProduct, images as File[]);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  console.log(type === BaseProductFormType.CREATE);

  return (
    <Form
      form={form}
      name="AddCategory"
      layout="vertical"
      requiredMark="optional"
      className={cx("form")}
      initialValues={{
        name: value?.name,
        category: value?.categoryIds,
        brand: value?.brandId,
        desc: value?.description,
        images: imageFiles,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="images"
        label="Hình ảnh"
        rules={[
          {
            validator: (_, value) =>
              type === BaseProductFormType.UPDATE ||
              images.filter((img) => img).length >= 3
                ? Promise.resolve()
                : Promise.reject(new Error("Vui lòng tải lên đủ 3 hình ảnh")),
          },
        ]}
      >
        <Space>
          {new Array(3).fill(0).map((_, index) => (
            <ImageUpload
              key={index}
              defaultValue={imageUrls?.[index]}
              onChange={(file, url) => {
                handleImageChange(index, file);
                handleImageUrlChange(index, url as string);
                form.validateFields(["images"]);
              }}
            />
          ))}
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
      <Form.Item
        name="category"
        label="Danh mục sản phẩm"
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
        rules={[{ required: true, message: "Vui lòng chọn nhãn hàng" }]}
      >
        <Select
          size="large"
          placeholder="Vui lòng chọn nhãn hàng"
          onChange={(value) => setBrandId(value)}
        >
          {brands.map((brand) => (
            <Select.Option key={brand.id} value={brand.id}>
              {brand.name}
            </Select.Option>
          ))}
        </Select>
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
      <Form.Item>
        <Flex justify="end">
          <Space>
            <Button
              danger
              onClick={(e) => {
                e.preventDefault();
                onCancel();
              }}
            >
              Hủy
            </Button>
            <Button htmlType="submit" type="primary">
              Tiếp tục
            </Button>
          </Space>
        </Flex>
      </Form.Item>
    </Form>
  );
};

export default BaseProductForm;
