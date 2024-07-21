import styles from "./OrderDetailModal.module.scss";
import classNames from "classnames/bind";

import { OrderStatus } from "@/constant/enum/orderStatus";
import { Order, OrderDetail } from "@/types/order";
import { CheckCircleOutlined } from "@ant-design/icons";
import {
  Button,
  message,
  Modal,
  Descriptions,
  List,
  Card,
  Badge,
  Flex,
  Typography,
  Grid,
  Table,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import { getOrderDetail, updateOrderStatus } from "@/services/order";
import { formatDate } from "@/formater/DateFormater";
import { PaymentMethod } from "@/constant/enum/paymentMethod";
import { formatCurrency } from "@/formater/CurrencyFormater";
import { PaymentStatus } from "@/constant/enum/paymentStatus";

interface IOrderDetailModal {
  open: boolean;
  data: Order;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const { Text, Title } = Typography;

const OrderDetailModal: React.FC<IOrderDetailModal> = ({
  open,
  data,
  onCancel,
}) => {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async (id: number) => {
      try {
        setLoading(true);
        const res = await getOrderDetail(id);
        setOrderDetail(res);
      } catch (error) {
        if (error instanceof Error) {
          messageApi.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    if (data) {
      fetcher(data.id);
    }
  }, [data]);

  const handleCancel = () => {
    onCancel();
  };

  const handleUpdateOrderStatus = async (status: OrderStatus) => {
    try {
      if (orderDetail) {
        setLoading(true);
        const res = await updateOrderStatus(orderDetail.id, status);
        setOrderDetail(res);
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    orderDetail && (
      <Modal
        destroyOnClose={true}
        title="Chi tiết hóa đơn"
        open={open}
        onCancel={() => handleCancel()}
        loading={loading}
        width={"70%"}
        footer={[
          <Button onClick={() => handleCancel()} key="1">
            Đóng
          </Button>,
          (data.status === OrderStatus.SHIPPING ||
            data.status === OrderStatus.PENDING) && (
            <Button
              type="primary"
              danger
              onClick={() => handleUpdateOrderStatus(OrderStatus.CANCEL)}
              key="2"
            >
              Hủy đơn hàng
            </Button>
          ),
          data.status === OrderStatus.PENDING && (
            <Button
              onClick={() => handleUpdateOrderStatus(OrderStatus.SHIPPING)}
              key="3"
              className={cx("btn")}
            >
              Xác nhận đơn hàng
            </Button>
          ),
          data.status === OrderStatus.SHIPPING && (
            <Button
              onClick={() => handleUpdateOrderStatus(OrderStatus.SUCCESS)}
              key="4"
              className={cx("btn")}
            >
              Giao hàng thành công
            </Button>
          ),
          data.status === OrderStatus.SUCCESS && (
            <Button
              type="primary"
              onClick={() => handleUpdateOrderStatus(OrderStatus.SUCCESS)}
              key="5"
              disabled
              className={cx("success")}
            >
              <CheckCircleOutlined />
              Đã giao hàng
            </Button>
          ),
          data.status === OrderStatus.CANCEL && (
            <Button
              type="primary"
              onClick={() => handleUpdateOrderStatus(OrderStatus.SUCCESS)}
              key="5"
              disabled
              danger
            >
              Đã hủy
            </Button>
          ),
        ]}
      >
        {contextHolder}
        <Descriptions
          title="Thông tin đơn hàng"
          bordered
          size="small"
          layout="vertical"
        >
          <Descriptions.Item label="Mã đơn hàng">
            {orderDetail.id}
          </Descriptions.Item>
          <Descriptions.Item label="Người đặt">
            {orderDetail.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatDate(orderDetail.createAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Người nhận">
            {orderDetail.receiverName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {orderDetail.receiverPhoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" contentStyle={{ fontWeight: 700 }}>
            {orderDetail.note}
          </Descriptions.Item>
          <Descriptions.Item
            label="Trạng thái"
            contentStyle={{ fontWeight: 700 }}
          >
            {(() => {
              switch (orderDetail.status) {
                case OrderStatus.PENDING:
                  return "Đang chờ xác nhận";
                case OrderStatus.SHIPPING:
                  return "Đang giao hàng";
                case OrderStatus.SUCCESS:
                  return "Giao hàng thành công";
                case OrderStatus.CANCEL:
                  return "Đơn hàng đã hủy";
                default:
                  return "Không xác định";
              }
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            {orderDetail.receiverAddress}
          </Descriptions.Item>
        </Descriptions>

        <Title level={5} className={cx("title")}>
          Sản phẩm
        </Title>
        <div className={cx("product")}>
          <Flex className={cx("header")}>
            <div className={cx("var-1")}>
              <Flex justify="start">
                <div className={cx("space")}></div>
                <Text strong>Sản phẩm</Text>
              </Flex>
            </div>
            <div className={cx("var-2")}>
              <Flex justify="center">
                <Text strong>Số lượng</Text>
              </Flex>
            </div>
            <div className={cx("var-3")}>
              <Flex justify="center">
                <Text strong>Đơn giá</Text>
              </Flex>
            </div>
            <div className={cx("var-4")}>
              <Flex justify="center">
                <Text strong>Thành tiền</Text>
              </Flex>
            </div>
          </Flex>
          <Divider />
          <List
            dataSource={orderDetail.orderDetails}
            renderItem={(item) => (
              <>
                <List.Item key={item.id}>
                  <div className={cx("var-1")}>
                    <List.Item.Meta
                      title={item.productName}
                      avatar={
                        <img
                          width={100}
                          alt="product"
                          src={item.productImage}
                        />
                      }
                      description={`Option: ${item.optionValue.join(", ")}`}
                    />
                  </div>
                  <div className={cx("var-2")}>
                    <Flex justify="center">{item.quantity}</Flex>
                  </div>
                  <div className={cx("var-3")}>
                    <Flex justify="center">{formatCurrency(item.price)}</Flex>
                  </div>
                  <div className={cx("var-4")}>
                    <Flex justify="center">
                      {formatCurrency(item.price * item.quantity)}
                    </Flex>
                  </div>
                </List.Item>
              </>
            )}
          />
        </div>

        <Descriptions
          title="Thông tin thanh toán"
          bordered
          layout="vertical"
          size="small"
        >
          <Descriptions.Item label="Phương thức thanh toán">
            {(() => {
              switch (orderDetail.payment.paymentMethod) {
                case PaymentMethod.CASH:
                  return "Tiền mặt";
                case PaymentMethod.VNPAY:
                  return "Ví VNPay";
                default:
                  return "Không xác định";
              }
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng giá">
            {formatCurrency(orderDetail.payment.totalPrice)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {(() => {
              switch (orderDetail.payment.status) {
                case PaymentStatus.PENDING:
                  return "Đang chờ thanh toán";
                case PaymentStatus.CANCEL:
                  return "Đã hủy";
                case PaymentStatus.SUCCESS:
                  return "Đã thanh toán";
                case PaymentStatus.REFUND:
                  return "Đã hoàn tiền";
                default:
                  return "Không xác định";
              }
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày thanh toán">
            {orderDetail.payment.paymentDate
              ? formatDate(orderDetail.payment.paymentDate)
              : "Chưa thanh toán"}
          </Descriptions.Item>
          <Descriptions.Item label="Mã giao dịch (nếu có)">
            {orderDetail.payment.paymentMethod !== PaymentMethod.CASH
              ? orderDetail.payment.transactionId
                ? orderDetail.payment.transactionId
                : "Chưa thanh toán"
              : "Thanh toán bằng tiền mặt"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    )
  );
};

export default OrderDetailModal;
