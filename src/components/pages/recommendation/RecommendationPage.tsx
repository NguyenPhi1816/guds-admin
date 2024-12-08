"use client";
import { calcRecommendationData, getMatrixData } from "@/services/user";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Flex, message, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

interface MatrixData {
  [key: string]: {
    [productId: string]: number;
  };
}

interface MatrixRow {
  key: string;
  userId: string;
  [productId: string]: number | string;
}

const RecommendationPage = () => {
  const [data, setData] = useState<MatrixData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setLoading(true);
        const matrix = await getMatrixData();
        setData(matrix);
      } catch (error) {
        if (error instanceof Error) {
          messageApi.open({
            type: "error",
            content: error.message,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetcher();
  }, []);

  const handleCalc = async () => {
    try {
      setLoading(true);
      const matrix = await calcRecommendationData();
      setData(matrix);
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const transformedData = Object.entries(data).map(([userId, scores]) => {
    return {
      key: userId,
      userId,
      ...scores,
    };
  });

  let columns: ColumnsType<MatrixRow> = [];

  if (Object.keys(data).length > 0) {
    const len = Object.keys(Object.values(data)[0]).length;

    columns = [
      {
        title: "User ID",
        dataIndex: "userId",
        key: "userId",
        fixed: "left",
      },
      ...Array.from({ length: len }, (_, i) => ({
        title: `Product ${i + 1}`,
        dataIndex: `${i + 1}`,
        key: `${i + 1}`,
        render: (value: number) => (
          <span style={{ color: value < 0 ? "red" : "green" }}>
            {value.toFixed(4)}
          </span>
        ),
      })),
    ];
  }

  return (
    <Flex
      vertical
      gap={16}
      style={{
        padding: 16,
        backgroundColor: "#FFF",
        height: "calc(100vh - 64px)",
      }}
    >
      <Flex justify="end" style={{ width: "100%" }}>
        <Button
          type="primary"
          loading={loading}
          onClick={handleCalc}
          style={{ backgroundColor: "var(--light-yellow)", color: "#000" }}
        >
          <ReloadOutlined />
          Tính toán loại
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={transformedData}
        pagination={false}
        bordered
        scroll={{ x: "100%" }}
      />
    </Flex>
  );
};

export default RecommendationPage;
