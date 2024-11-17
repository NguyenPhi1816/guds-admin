import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";
import { Button, Card, Flex, Modal, Space } from "antd";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/formater/CurrencyFormater";
import { getOrderStatisticByProductSlug } from "@/services/order";

const ProductViewsChart = dynamic(
  () => import("../../charts/ProductViewsChart"),
  { ssr: false }
);
const ProductCartsChart = dynamic(
  () => import("../../charts/ProductCartsChart"),
  { ssr: false }
);
const ProductFavoritesChart = dynamic(
  () => import("../../charts/ProductFavoritesChart"),
  { ssr: false }
);
const ProductPurchasesChart = dynamic(
  () => import("../../charts/ProductPurchasesChart"),
  { ssr: false }
);
const PriceChangeChart = dynamic(
  () => import("../../charts/PriceChangeChart"),
  {
    ssr: false,
  }
);

interface IProductChart {
  productId: number;
  productSlug: string;
  open: boolean;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const ProductChart: React.FC<IProductChart> = ({
  productId,
  productSlug,
  open,
  onCancel,
}) => {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalSold, setTotalSold] = useState<number>(0);

  useEffect(() => {
    async function fetcher() {
      const response = await getOrderStatisticByProductSlug(productSlug);
      setTotalRevenue(response.totalRevenue);
      setTotalSold(response.totalSold);
    }

    fetcher();
  }, []);

  return (
    <Modal
      destroyOnClose={true}
      title={"Chi tiết sản phẩm"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button onClick={onCancel} key="close">
          Đóng
        </Button>,
      ]}
      style={{ minWidth: "900px" }}
    >
      <Flex gap={16} style={{ marginBottom: 16 }}>
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
            <span className={cx("statistic-item-number")}>{totalSold}</span>
          </Flex>
        </Card>
      </Flex>
      <Space direction="vertical">
        <ProductViewsChart productId={productId} />
        <ProductCartsChart productId={productId} />
        <ProductFavoritesChart productId={productId} />
        <ProductPurchasesChart productId={productId} />
        <PriceChangeChart productId={productId} />
      </Space>
    </Modal>
  );
};

export default ProductChart;
