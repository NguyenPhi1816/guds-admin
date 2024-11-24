"use client";
import styles from "./PromotionPage.module.scss";
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
  EyeOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Column from "antd/es/table/Column";
import { getPromotions } from "@/services/promotion";
import { Promotion } from "@/types/promotion";
import day from "@/lib/day";
import CreatePromotionModal from "@/components/modal/promotion/Create";
import PromotionDetailModal from "@/components/modal/promotion/Detail";

const cx = classNames.bind(styles);

const CategoryPage = () => {
  const [data, setData] = useState<Promotion[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Promotion[]>([]);
  const [modalValue, setModalValue] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res = await getPromotions();
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
    setIsModalOpen(true);
  };

  const showEditModal = (item: Promotion) => {
    setModalValue(item);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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

  const handleOpenDetailModel = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setIsDetailModalOpen(true);
  };

  const handleCancelDetailModel = () => {
    setCurrentPromotion(null);
    setIsDetailModalOpen(false);
  };

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách các đợt khuyến mãi</Title>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Space>
              <Typography.Text>Tìm kiếm</Typography.Text>
              <Input
                placeholder="Tên đợt khuyến mãi"
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
              Thêm đợt khuyến mãi
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
          sorter={(a: Promotion, b: Promotion) => {
            return a.id - b.id;
          }}
        />
        <Column title="Tên đợt khuyến mãi" dataIndex="name" key="name" />
        <Column
          title="Ngày bắt đầu"
          dataIndex="startDate"
          key="startDate"
          render={(text) => day(text).format("DD/MM/YYYY")}
        />
        <Column
          title="Ngày kết thúc"
          dataIndex="endDate"
          key="endDate"
          render={(text) => day(text).format("DD/MM/YYYY")}
        />
        <Column
          title="Hành động"
          key="action"
          render={(_promotion: Promotion) => (
            <Button
              type="primary"
              className={cx("btn")}
              onClick={() => handleOpenDetailModel(_promotion)}
            >
              <EyeOutlined />
              Chi tiết
            </Button>
          )}
        />
      </Table>
      <CreatePromotionModal
        value={modalValue}
        open={isModalOpen}
        onCancel={handleCancel}
        onFinish={handleRefresh}
      />
      <PromotionDetailModal
        value={currentPromotion}
        open={isDetailModalOpen}
        onCancel={handleCancelDetailModel}
        onFinish={handleRefresh}
      />
      {contextHolder}
    </div>
  );
};

export default CategoryPage;
