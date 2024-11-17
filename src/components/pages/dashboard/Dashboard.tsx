"use client";
import AllProductPurchasesChart from "@/components/charts/AllProductPurchasesChart";
import styles from "./Dashboard.module.scss";
import classNames from "classnames/bind";
import { Card, Flex, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { getOrderStatistic } from "@/services/order";
import { OrderStatus } from "@/constant/enum/orderStatus";
import { formatCurrency } from "@/formater/CurrencyFormater";
import Column from "antd/es/table/Column";
import {
  getTop10MostPurchasedCategories,
  getTop10MostPurchasedProducts,
} from "@/services/statistics";

const cx = classNames.bind(styles);

const Dashboard: React.FC = () => {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [numberOfOrders, setNumberOfOrders] = useState<number>(0);
  const [numberOfPendingOrders, setNumberOfPendingOrders] = useState<number>(0);
  const [numberOfShippingOrders, setNumberOfShippingOrders] =
    useState<number>(0);
  const [numberOfSuccessOrders, setNumberOfSuccessOrders] = useState<number>(0);
  const [numberOfCancelOrders, setNumberOfCancelOrders] = useState<number>(0);
  const [top10MostPurchasedProducts, setTop10MostPurchasedProducts] =
    useState<any>();
  const [top10MostPurchasedCategories, setTop10MostPurchasedCategories] =
    useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetcher() {
      setIsLoading(true);
      const response = await getOrderStatistic();
      setTotalRevenue(response["TOTAL_REVENUE"]);
      setNumberOfOrders(response["TOTAL"]);
      setNumberOfPendingOrders(response[OrderStatus.PENDING]);
      setNumberOfShippingOrders(response[OrderStatus.SHIPPING]);
      setNumberOfSuccessOrders(response[OrderStatus.SUCCESS]);
      setNumberOfCancelOrders(response[OrderStatus.CANCEL]);

      const top10MostPurchasedProducts = await getTop10MostPurchasedProducts();
      setTop10MostPurchasedProducts(top10MostPurchasedProducts);

      const top10MostPurchasedCategories =
        await getTop10MostPurchasedCategories();
      setTop10MostPurchasedCategories(top10MostPurchasedCategories);
      setIsLoading(false);
    }

    fetcher();
  }, []);

  return (
    <Flex vertical className={cx("dashboard")} gap={16}>
      <Flex gap={16}>
        <Card
          className={cx("statistic-item", "total-revenue")}
          title="Tổng doanh thu"
        >
          <Flex justify="center" align="center">
            <span className={cx("statistic-item-number")}>
              {formatCurrency(totalRevenue)}
            </span>
          </Flex>
        </Card>
        <Card className={cx("statistic-item")} title="Tổng đơn hàng">
          <Flex justify="center" align="center">
            <span className={cx("statistic-item-number")}>
              {numberOfOrders}
            </span>
          </Flex>
        </Card>
      </Flex>
      <Flex gap={16}>
        <Card className={cx("statistic-item")} title="Đơn hàng đang chờ">
          <Flex justify="center" align="center">
            <span className={cx("statistic-item-number")}>
              {numberOfPendingOrders}
            </span>
          </Flex>
        </Card>
        <Card className={cx("statistic-item")} title="Đơn hàng đang giao">
          <Flex justify="center" align="center">
            <span className={cx("statistic-item-number")}>
              {numberOfShippingOrders}
            </span>
          </Flex>
        </Card>
        <Card className={cx("statistic-item")} title="Đơn hàng đã giao">
          <Flex justify="center" align="center">
            <span className={cx("statistic-item-number")}>
              {numberOfSuccessOrders}
            </span>
          </Flex>
        </Card>
        <Card className={cx("statistic-item")} title="Đơn hàng đã hủy">
          <Flex justify="center" align="center">
            <span className={cx("statistic-item-number")}>
              {numberOfCancelOrders}
            </span>
          </Flex>
        </Card>
      </Flex>
      <AllProductPurchasesChart />
      <Card title="Top 10 sản phẩm được bán nhiều nhất">
        <Table
          dataSource={top10MostPurchasedProducts}
          rowKey={(record) => record.id}
          loading={isLoading}
          pagination={false}
        >
          <Column
            title="Id"
            dataIndex="id"
            key="id"
            sorter={(a: any, b: any) => {
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
          <Column title="Số lượt bán" dataIndex="count" key="count" />
        </Table>
      </Card>
      <Card title="Top 10 danh mục sản phẩm được bán nhiều nhất">
        <Table
          dataSource={top10MostPurchasedCategories}
          rowKey={(record) => record.id}
          loading={isLoading}
          pagination={false}
        >
          <Column
            title="Id"
            dataIndex="id"
            key="id"
            sorter={(a: any, b: any) => {
              return a.id - b.id;
            }}
          />
          <Column title="Slug" dataIndex="slug" key="slug" />
          <Column title="Tên danh mục" dataIndex="name" key="name" />
          <Column
            title="Mô tả"
            dataIndex="description"
            key="description"
            ellipsis={true}
          />
          <Column title="Số lượt bán" dataIndex="count" key="count" />
        </Table>
      </Card>
    </Flex>
  );
};

export default Dashboard;
