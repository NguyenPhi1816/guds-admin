"use client";
import styles from "./Product.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Space,
  Switch,
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
import { BaseProduct, UpdateBaseProductStatusRequest } from "@/types/product";
import { getAllProduct, updateBaseProductStatus } from "@/services/product";
import { productStatus } from "@/constant/enum/productStatus";
import CreateProductModal from "@/components/modal/product/CreateProductModal";
import UpdateProductModal from "@/components/modal/product/UpdateProductModal";

const cx = classNames.bind(styles);

const ProductPage = () => {
  const [data, setData] = useState<BaseProduct[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<BaseProduct[]>([]);
  const [currentBaseProductSlug, setCurrentBaseProductSlug] = useState<
    string | null
  >(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);

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
    setCreateModalOpen(true);
  };

  const showEditModal = (slug: string) => {
    setCurrentBaseProductSlug(slug);
    setUpdateModalOpen(true);
  };

  const handleCancelUpdate = () => {
    setUpdateModalOpen(false);
    setRefresh(true);
    setCurrentBaseProductSlug(null);
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

  const handleChangeStatus = async (id: number, status: productStatus) => {
    try {
      const request: UpdateBaseProductStatusRequest = {
        id,
        status,
      };
      await updateBaseProductStatus(request);
      setRefresh(true);
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      }
    }
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
          key="status"
          render={(_baseProduct: BaseProduct) => (
            <Switch
              defaultChecked={_baseProduct.status === productStatus.ACTIVE}
              onChange={() =>
                handleChangeStatus(
                  _baseProduct.id,
                  _baseProduct.status === productStatus.ACTIVE
                    ? productStatus.INACTIVE
                    : productStatus.ACTIVE
                )
              }
            />
          )}
        />
        <Column
          title="Hành động"
          key="action"
          render={(_baseProduct: BaseProduct) => (
            <Button
              type="primary"
              className={cx("btn")}
              onClick={() => showEditModal(_baseProduct.slug)}
            >
              <EditOutlined />
              Chỉnh sửa
            </Button>
          )}
        />
      </Table>
      <CreateProductModal
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          setRefresh(true);
        }}
      />
      {currentBaseProductSlug && (
        <UpdateProductModal
          open={updateModalOpen}
          slug={currentBaseProductSlug}
          onCancel={handleCancelUpdate}
        />
      )}
      {contextHolder}
    </div>
  );
};

export default ProductPage;
