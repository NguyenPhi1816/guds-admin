import { Button, Modal, Space } from "antd";
import dynamic from "next/dynamic";
import React from "react";

const AllProductPurchasesChart = dynamic(
  () => import("../../charts/AllProductPurchasesChart"),
  { ssr: false }
);

interface IPurchaseChart {
  open: boolean;
  onCancel: () => void;
}

const PurchaseChart: React.FC<IPurchaseChart> = ({ open, onCancel }) => {
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
      <AllProductPurchasesChart />
    </Modal>
  );
};

export default PurchaseChart;
