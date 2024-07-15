import { productStatus } from "@/constant/enum/productStatus";
import { getBrandProduct } from "@/services/brand";
import { getCategoryChildren, getCategoryProduct } from "@/services/category";
import { CategoryResponse } from "@/types/category";
import { Badge, Button, Modal, Space, Table, Tag } from "antd";
import Column from "antd/es/table/Column";
import React, { useEffect, useState } from "react";

export enum ProductTableModalType {
  BRAND,
  CATEGORY,
}

export interface IProductTableModal {
  type: ProductTableModalType;
  slug: string;
  open: boolean;
  onCancel: () => void;
}

export type ProductResponse = {
  id: number;
  slug: string;
  name: string;
  category: {
    id: number;
    slug: string;
    name: string;
  }[];
  brand: {
    id: number;
    slug: string;
    name: string;
  };
  status: string;
};

const ProductTableModal: React.FC<IProductTableModal> = ({
  type,
  slug,
  open,
  onCancel,
}) => {
  const [data, setData] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        switch (type) {
          case ProductTableModalType.CATEGORY: {
            const res: ProductResponse[] = await getCategoryProduct(slug);
            setData(res);
            break;
          }
          case ProductTableModalType.BRAND: {
            const res: ProductResponse[] = await getBrandProduct(slug);
            setData(res);
            break;
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug !== "") fetcher();
  }, [slug]);

  return (
    <Modal
      destroyOnClose={true}
      title={"Danh sách sản phẩm"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button onClick={onCancel} key={1}>
          Đóng
        </Button>,
      ]}
      width={1000}
    >
      <Table
        dataSource={data}
        rowKey={(record) => record.id}
        loading={isLoading}
        pagination={false}
      >
        <Column
          title="Id"
          dataIndex="id"
          key="id"
          sorter={(a: CategoryResponse, b: CategoryResponse) => {
            return a.id - b.id;
          }}
        />
        <Column title="Slug" dataIndex="slug" key="slug" />
        <Column title="Tên sản phẩm" dataIndex="name" key="name" />
        <Column
          title="Danh mục"
          dataIndex="category"
          key="category"
          render={(category) => (
            <Space>
              {category.map((item: any) => (
                <Tag key={item.id}>{item.name}</Tag>
              ))}
            </Space>
          )}
        />
        <Column
          title="Thương hiệu"
          dataIndex="brand"
          key="brand"
          render={(brand) => brand.name}
        />
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
      </Table>
    </Modal>
  );
};

export default ProductTableModal;
