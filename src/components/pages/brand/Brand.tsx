"use client";
import styles from "./Brand.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Space,
  Table,
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

const cx = classNames.bind(styles);

const BrandPage = () => {
  const [data, setData] = useState<Brand[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Brand[]>([]);
  const [modalType, setModalType] = useState<BrandModalType>(
    BrandModalType.CREATE
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
        const res = await getAllBrand();
        if (res) {
          setData(res);
        }
      } catch (error) {
        throw error;
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
    setModalType(BrandModalType.CREATE);
    setIsModalOpen(true);
  };

  const showEditModal = (item: Brand) => {
    setModalValue(item);
    setModalType(BrandModalType.EDIT);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModalType(BrandModalType.CREATE);
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
      <Title>Danh sách Nhãn hàng</Title>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Space>
              <Typography.Text>Tìm kiếm</Typography.Text>
              <Input
                placeholder="Tên nhãn hàng"
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
              Thêm nhãn hàng
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
          sorter={(a: Brand, b: Brand) => {
            return a.id - b.id;
          }}
        />
        <Column title="Slug" dataIndex="slug" key="slug" />
        <Column title="Tên nhãn hàng" dataIndex="name" key="name" />
        <Column
          title="Sản phẩm"
          key="baseProduct"
          render={(_category: Brand) => (
            <Button onClick={() => handleOpenProductModal(_category.slug)}>
              {_category.numberOfProducts}
            </Button>
          )}
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
      <BrandModal
        type={modalType}
        value={modalValue}
        open={isModalOpen}
        onCancel={handleCancel}
        onFinish={handleRefresh}
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

export default BrandPage;
