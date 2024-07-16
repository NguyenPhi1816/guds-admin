"use client";
import styles from "./Product.module.scss";
import classNames from "classnames/bind";

import {
  Badge,
  Button,
  Flex,
  Form,
  Input,
  message,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import {
  EditOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Column from "antd/es/table/Column";
import ProductTableModal from "@/components/modal/productTableModal";
import { getAllBrand } from "@/services/brand";
import { Brand } from "@/types/brand";
import BrandModal, {
  BrandModalType,
} from "@/components/modal/brand/BrandModal";
import { ProductTableModalType } from "@/components/modal/productTableModal/ProductTableModal";
import { BaseProduct } from "@/types/product";
import { getAllProduct } from "@/services/product";
import { productStatus } from "@/constant/enum/productStatus";
import ProductModal, {
  ProductModalType,
} from "@/components/modal/product/ProductModal";

const cx = classNames.bind(styles);

const ProductPage = () => {
  const [data, setData] = useState<BaseProduct[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<BaseProduct[]>([]);
  const [modalType, setModalType] = useState<ProductModalType>(
    ProductModalType.CREATE
  );
  const [modalValue, setModalValue] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res = await getAllProduct();
        if (res) {
          setData(res);
        }
      } catch (error) {
        if (error instanceof Error) {
          messageApi.open({
            type: "error",
            content: error.message,
          });
        }
      } finally {
        setRefresh(false);
        setIsLoading(false);
      }
    };
    fetcher();
  }, [refresh]);

  useEffect(() => {
    if (data) {
      const result = data.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSearchResult(result);
    }
  }, [data, searchValue]);

  const showCreateModal = () => {
    setModalType(ProductModalType.CREATE);
    setIsModalOpen(true);
  };

  const showEditModal = (item: Brand) => {
    setModalValue(item);
    setModalType(ProductModalType.UPDATE);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModalType(ProductModalType.CREATE);
    setModalValue(null);
  };

  const handleRefresh = (message: string) => {
    setRefresh(true);
    if (message !== "") {
      messageApi.open({
        type: "success",
        content: message,
      });
    }
  };

  const handleOpenProductModal = (slug: string) => {
    setIsProductModalOpen(true);
    setCurrentCategorySlug(slug);
  };

  const handleCancelProductModal = () => {
    setIsProductModalOpen(false);
    setCurrentCategorySlug("");
  };

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách sản phẩm</Title>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Space>
              <Typography.Text>Tìm kiếm</Typography.Text>
              <Input
                placeholder="Tên sản phẩm"
                suffix={<SearchOutlined />}
                size="large"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
            </Space>
          </Form.Item>
        </Form>
        <div className={cx("btn-wrapper")}>
          <Space>
            <Button
              onClick={() => handleRefresh("")}
              type="primary"
              className={cx("btn")}
              disabled={isLoading}
            >
              <ReloadOutlined />
              Tải lại
            </Button>
            <Button
              onClick={showCreateModal}
              type="primary"
              className={cx("btn")}
              disabled={isLoading}
            >
              <PlusCircleOutlined />
              Thêm sản phẩm
            </Button>
          </Space>
        </div>
      </Flex>
      <Table
        dataSource={searchResult}
        rowKey={(record) => record.id}
        loading={isLoading}
        pagination={false}
      >
        <Column
          title="Id"
          dataIndex="id"
          key="id"
          sorter={(a: BaseProduct, b: BaseProduct) => {
            return a.id - b.id;
          }}
        />
        <Column title="Slug" dataIndex="slug" key="slug" />
        <Column title="Tên sản phẩm" dataIndex="name" key="name" />
        <Column
          title="Danh mục"
          dataIndex="categories"
          key="categories"
          render={(categories: string[]) => (
            <Space>
              {categories.map((item: string) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </Space>
          )}
        />
        <Column title="Thương hiệu" dataIndex="brand" key="brand" />
        <Column
          title="Trạng thái"
          dataIndex="status"
          key="status"
          render={(status: string) => {
            switch (status) {
              case productStatus.ACTIVE: {
                return <Badge status="success" text={status} />;
              }
            }
          }}
        />
        <Column
          title="Hành động"
          key="action"
          render={(_brand: Brand) => (
            <Button
              type="primary"
              className={cx("btn")}
              onClick={() => showEditModal(_brand)}
            >
              <EditOutlined />
              Chỉnh sửa
            </Button>
          )}
        />
      </Table>
      <ProductModal
        type={modalType}
        open={isModalOpen}
        onCancel={handleCancel}
      />
      <ProductTableModal
        type={ProductTableModalType.BRAND}
        slug={currentCategorySlug}
        open={isProductModalOpen}
        onCancel={handleCancelProductModal}
      />
      {contextHolder}
    </div>
  );
};

export default ProductPage;
