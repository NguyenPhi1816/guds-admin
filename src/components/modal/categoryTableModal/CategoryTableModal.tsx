import { getCategoryChildren } from "@/services/category";
import { CategoryResponse } from "@/types/category";
import { Button, Flex, message, Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import React, { useEffect, useState } from "react";

interface ICategoryTableModal {
  slug: string;
  open: boolean;
  onCancel: () => void;
}

const CategoryTableModal: React.FC<ICategoryTableModal> = ({
  slug,
  open,
  onCancel,
}) => {
  const [data, setData] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res: CategoryResponse[] = await getCategoryChildren(slug);
        setData(res);
      } catch (error) {
        if (error instanceof Error) {
          messageApi.open({
            type: "error",
            content: error.message,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (slug !== "") fetcher();
  }, [slug]);

  return (
    <Modal
      destroyOnClose={true}
      title={"Danh sách danh mục sản phẩm con"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button onClick={onCancel} key={1}>
          Đóng
        </Button>,
      ]}
      width={750}
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
        <Column title="Tên danh mục" dataIndex="name" key="name" />
        <Column title="Mô tả" dataIndex="description" key="description" />
        <Column
          title="Sản phẩm"
          dataIndex="numberOfBaseProduct"
          key="numberOfBaseProduct"
          render={(numberOfBaseProduct: number) => (
            <Flex justify="center">
              <Button>{numberOfBaseProduct}</Button>
            </Flex>
          )}
        />
        <Column
          title="Danh mục con"
          dataIndex="numberOfChildren"
          key="numberOfChildren"
          render={(numberOfChildren: number) => (
            <Flex justify="center">
              <Button>{numberOfChildren}</Button>
            </Flex>
          )}
        />
      </Table>
      {contextHolder}
    </Modal>
  );
};

export default CategoryTableModal;
