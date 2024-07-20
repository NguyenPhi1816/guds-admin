import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";
import { Form, Input, Select, Space } from "antd";
import ImageUpload from "@/components/upload/ImageUpload";
import React, { useCallback, useEffect, useState } from "react";
import { CategoryResponse } from "@/types/category";
import { Brand } from "@/types/brand";
import { getAllCategory } from "@/services/category";
import { getAllBrand } from "@/services/brand";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CreateBaseProductRequest } from "@/types/product";
import debounce from "lodash/debounce";

interface IBaseProductForm {
  defaultValue: CreateBaseProductRequest;
  onChange: (
    baseProduct: CreateBaseProductRequest,
    images: (File | null)[]
  ) => void;
}

const cx = classNames.bind(styles);

const BaseProductForm: React.FC<IBaseProductForm> = ({
  defaultValue,
  onChange,
}) => {
  const INITIAL_IMAGES = [null, null, null];

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [images, setImages] = useState<(File | null)[]>(INITIAL_IMAGES);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brandId, setBrandId] = useState<number>(-1);

  // get categories and brands
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
    setName(defaultValue.name);
    setDesc(defaultValue.description);
    setCategoryIds(defaultValue.categoryIds);
    setBrandId(defaultValue.brandId);
    setImageUrls(defaultValue.images);
  }, [defaultValue]);

  const debouncedOnChange = useCallback(
    debounce((newDesc: string) => {
      setDesc(newDesc);
    }, 300),
    []
  );

  useEffect(() => {
    if (
      name !== defaultValue.name ||
      desc !== defaultValue.description ||
      brandId !== defaultValue.brandId ||
      JSON.stringify(categoryIds) !==
        JSON.stringify(defaultValue.categoryIds) ||
      JSON.stringify(imageUrls) !== JSON.stringify(defaultValue.images) ||
      JSON.stringify(images) !== JSON.stringify(INITIAL_IMAGES)
    ) {
      const baseProduct: CreateBaseProductRequest = {
        name: name,
        description: desc,
        categoryIds: categoryIds,
        brandId: brandId,
        images: imageUrls,
      };
      onChange(baseProduct, images);
    }
  }, [name, desc, categoryIds, brandId, images]);

  const handleImageChange = (index: number, file: File) => {
    setImages((prev) => {
      const newValue = [...prev];
      newValue[index] = file;
      return newValue;
    });
  };

  return (
    <Form
      name="AddCategory"
      layout="vertical"
      requiredMark="optional"
      className={cx("form")}
      fields={[
        { name: "name", value: name },
        { name: "category", value: categoryIds },
        { name: "brand", value: brandId },
        { name: "desc", value: desc },
      ]}
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
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Item>
      <Form.Item name="category" label="Danh mục sản phẩm">
        <Select
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
      <Form.Item name="brand" label="Nhãn hàng">
        <Select onChange={(value) => setBrandId(value)}>
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
          onChange={debouncedOnChange}
        />
      </Form.Item>
    </Form>
  );
};

export default BaseProductForm;
