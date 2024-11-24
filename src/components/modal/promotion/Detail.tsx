import styles from "./Create.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  AppliedDiscountProduct,
  CreateDiscountRequest,
  CreatePromotionRequest,
  CreateVoucherRequest,
  DiscountDetail,
  Promotion,
  PromotionDetail,
  VoucherDetail,
} from "@/types/promotion";
import {
  createDiscount,
  createPromotion,
  createVoucher,
  deleteDiscount,
  deleteVoucher,
  getPromotionDetail,
  updateDiscountStatus,
  updateVoucherStatus,
} from "@/services/promotion";
import day from "@/lib/day";
import Column from "antd/es/table/Column";
import { formatCurrency } from "@/formater/CurrencyFormater";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { productStatus } from "@/constant/enum/productStatus";
import { BaseProduct } from "@/types/product";
import { getAllProduct } from "@/services/product";

interface IPromotionDetailModal {
  value?: Promotion | null;
  open: boolean;
  onCancel: () => void;
  onFinish: (message: string) => void;
}

enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

enum VoucherType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

enum DiscountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum VoucherStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const cx = classNames.bind(styles);

const PromotionDetailModal: React.FC<IPromotionDetailModal> = ({
  value,
  open,
  onCancel,
  onFinish,
}) => {
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [discountForm] = Form.useForm();
  const [voucherForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<PromotionDetail | null>(null);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountDetail | null>(
    null
  );
  const [showCreateDiscountModal, setShowCreateDiscountModal] =
    useState<boolean>(false);
  const [showCreateVoucherModal, setShowCreateVoucherModal] =
    useState<boolean>(false);
  const [showAppliedProductsModal, setShowAppliedProductsModal] =
    useState<boolean>(false);
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
  const [prefix, setPrefix] = useState("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [maxValueVoucher, setMaxValueVoucher] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    setTitle("Thêm đợt khuyến mãi");
    form.resetFields();
  }, [form]);

  useEffect(() => {
    async function fetcher() {
      if (value) {
        const data = await getPromotionDetail(value.id);
        form.setFieldsValue({
          promotionName: data.name,
          startDate: day(data.startDate),
          endDate: day(data.endDate),
        });
        setData(data);
        const today = day();
        setIsDisabled(today.isAfter(data.startDate));
      }
    }

    fetcher();
  }, [value, form]);

  useEffect(() => {
    async function fetcher() {
      try {
        const res = await getAllProduct();
        if (res) {
          setBaseProducts(res);
        }
      } catch (error) {
        if (error instanceof Error) {
          messageApi.open({
            type: "error",
            content: error.message,
          });
        }
      }
    }

    fetcher();
  }, []);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleShowCreateDiscountModal = () => {
    discountForm.resetFields();
    setShowCreateDiscountModal(true);
  };

  const handleCloseCreateDiscountModal = () => {
    discountForm.resetFields();
    setShowCreateDiscountModal(false);
  };

  const handleShowCreateVoucherModal = () => {
    voucherForm.resetFields();
    setShowCreateVoucherModal(true);
  };

  const handleCloseCreateVoucherModal = () => {
    voucherForm.resetFields();
    setShowCreateVoucherModal(false);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.type) {
      setPrefix(changedValues.type === "PERCENTAGE" ? "%" : "VNĐ");
    }
  };

  const handleVoucherFormValuesChange = (
    changedValues: any,
    allValues: any
  ) => {
    if (changedValues.type) {
      setMaxValueVoucher(changedValues.type === "PERCENTAGE" ? 100 : undefined);
      setPrefix(changedValues.type === "PERCENTAGE" ? "%" : "VNĐ");
    }
  };

  const handleFinish = (message: string) => {
    onFinish(message);
  };

  const handleCreateDiscount = async () => {
    if (value && data) {
      try {
        const values = await discountForm.validateFields();

        setLoading(true);
        const request: CreateDiscountRequest = {
          type: values.type,
          value: values.value,
          promotionId: value.id,
          appliedProductIds: values.appliedProductIds,
        };
        const discountDetail = await createDiscount(request);
        if (discountDetail) {
          setData((prev) => {
            if (prev) {
              return {
                ...prev,
                discounts: [...prev.discounts, discountDetail],
              };
            }
            return null;
          });
          messageApi.open({
            type: "success",
            content: "Tạo khuyến mãi thành công",
          });
          handleCloseCreateDiscountModal();
        }
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
    }
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (value && data) {
      try {
        setLoading(true);
        const result = await deleteDiscount(discountId);
        if (result) {
          setData((prev) => {
            if (prev) {
              return {
                ...prev,
                discounts: prev.discounts.filter(
                  (item) => item.id !== discountId
                ),
              };
            }
            return null;
          });
          messageApi.open({
            type: "success",
            content: "Xóa khuyến mãi thành công",
          });
        }
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
    }
  };

  const handleCreateVoucher = async () => {
    if (value && data) {
      try {
        const values = await voucherForm.validateFields();

        setLoading(true);
        const request: CreateVoucherRequest = {
          ...values,
          promotionId: value.id,
        };
        const voucherDetail = await createVoucher(request);
        if (voucherDetail) {
          setData((prev) => {
            if (prev) {
              return {
                ...prev,
                vouchers: [...prev.vouchers, voucherDetail],
              };
            }
            return null;
          });
          messageApi.open({
            type: "success",
            content: "Tạo phiếu mua hàng thành công",
          });
          handleCloseCreateVoucherModal();
        }
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
    }
  };

  const handleDeleteVoucher = async (voucherId: number) => {
    if (value && data) {
      try {
        setLoading(true);
        const result = await deleteVoucher(voucherId);
        if (result) {
          setData((prev) => {
            if (prev) {
              return {
                ...prev,
                vouchers: prev.vouchers.filter((item) => item.id !== voucherId),
              };
            }
            return null;
          });
          messageApi.open({
            type: "success",
            content: "Xóa phiếu mua hàng thành công",
          });
        }
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
    }
  };

  const handleUpdateDiscountStatus = async (
    discountId: number,
    status: string
  ) => {
    try {
      const result = await updateDiscountStatus(discountId, status);
      if (result) {
        messageApi.open({
          type: "success",
          content: "Cập nhật trạng thái thành công",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    }
  };

  const handleUpdateVoucherStatus = async (
    voucherId: number,
    status: string
  ) => {
    try {
      const result = await updateVoucherStatus(voucherId, status);
      if (result) {
        messageApi.open({
          type: "success",
          content: "Cập nhật trạng thái thành công",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    }
  };

  const showConfirmDelete = (callback: () => {}) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa khuyến mãi này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => callback(),
      onCancel: () => {
        message.info("Hành động xóa đã bị hủy");
      },
    });
  };

  if (!data) {
    return <div></div>;
  }

  return (
    <>
      <Modal
        width={1200}
        destroyOnClose={true}
        title={title}
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button onClick={handleCancel} key={1}>
            Đóng
          </Button>,
        ]}
      >
        <Form
          form={form}
          name="category"
          layout="vertical"
          requiredMark="optional"
          className={cx("form")}
        >
          <Flex gap={16}>
            <Form.Item
              name="promotionName"
              label="Tên đợt khuyến mãi"
              rules={[
                { required: true, message: "Tên đợt khuyến mãi là bắt buộc" },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Tên đợt khuyến mãi" size="large" />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Ngày bắt đầu là bắt buộc" }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: "Ngày kết thúc là bắt buộc" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate");
                    if (
                      !startDate ||
                      !value ||
                      day(value).isSameOrAfter(startDate)
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
                      )
                    );
                  },
                }),
              ]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Flex>
        </Form>
        <Space direction="vertical" size={"large"} style={{ width: "100%" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Title level={5}>Danh sách giảm giá sản phẩm</Title>
              <Button
                onClick={handleShowCreateDiscountModal}
                className={cx("btn")}
                disabled={isDisabled}
                type="primary"
              >
                <PlusCircleOutlined />
                Thêm
              </Button>
            </Flex>
            <Table
              dataSource={data.discounts}
              rowKey={(record) => record.id}
              loading={dataLoading}
              pagination={false}
            >
              <Column
                title="Id"
                dataIndex="id"
                key="id"
                sorter={(a: DiscountDetail, b: DiscountDetail) => {
                  return a.id - b.id;
                }}
              />
              <Column
                title="Loại giảm giá"
                dataIndex="type"
                key="type"
                render={(text) =>
                  text == DiscountType.PERCENTAGE ? "Phần trăm" : "Cố định"
                }
              />
              <Column
                title="Giá trị"
                key="value"
                render={(_discount: DiscountDetail) =>
                  _discount.type == DiscountType.PERCENTAGE
                    ? `${_discount.value}%`
                    : `${formatCurrency(_discount.value)}`
                }
              />
              <Column
                title="Trạng thái"
                key="status"
                render={(_discount: DiscountDetail) => (
                  <Switch
                    defaultChecked={_discount.status === DiscountStatus.ACTIVE}
                    onChange={() => {
                      const newStatus =
                        _discount.status === DiscountStatus.ACTIVE
                          ? DiscountStatus.INACTIVE
                          : DiscountStatus.ACTIVE;
                      handleUpdateDiscountStatus(_discount.id, newStatus);
                    }}
                  />
                )}
              />
              <Column
                title="Sản phẩm áp dụng"
                key="action1"
                render={(_discount: DiscountDetail) => (
                  <Button
                    className={cx("btn")}
                    onClick={() => {
                      setCurrentDiscount(_discount);
                      setShowAppliedProductsModal(true);
                    }}
                  >
                    <EyeOutlined />
                    Xem sản phẩm
                  </Button>
                )}
              />
              <Column
                title="Hành động"
                key="action2"
                render={(_discount: DiscountDetail) => (
                  <Button
                    type="primary"
                    className={cx("btn-danger")}
                    disabled={isDisabled}
                    onClick={() =>
                      showConfirmDelete(() =>
                        handleDeleteDiscount(_discount.id)
                      )
                    }
                  >
                    <DeleteOutlined />
                    Xóa
                  </Button>
                )}
              />
            </Table>
          </Space>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Title level={5}>Danh sách phiếu mua hàng</Title>
              <Button
                onClick={handleShowCreateVoucherModal}
                className={cx("btn")}
                type="primary"
                disabled={isDisabled}
              >
                <PlusCircleOutlined />
                Thêm
              </Button>
            </Flex>
            <Table
              dataSource={data.vouchers}
              rowKey={(record) => record.id}
              loading={dataLoading}
              pagination={false}
            >
              <Column
                title="Id"
                dataIndex="id"
                key="id"
                sorter={(a: VoucherDetail, b: VoucherDetail) => {
                  return a.id - b.id;
                }}
              />
              <Column title="Mã code" dataIndex="code" key="code" />
              <Column
                title="Loại phiếu"
                dataIndex="type"
                key="type"
                render={(text) =>
                  text == VoucherType.PERCENTAGE ? "Phần trăm" : "Cố định"
                }
              />
              <Column
                title="Giá trị"
                key="value"
                render={(_voucher: VoucherDetail) =>
                  _voucher.type == DiscountType.PERCENTAGE
                    ? `${_voucher.value}%`
                    : `${formatCurrency(_voucher.value)}`
                }
              />
              <Column
                title="Đơn hàng tối thiểu"
                dataIndex="minOrderValue"
                key="minOrderValue"
                render={(text) => formatCurrency(text)}
              />
              <Column
                title="Khuyến mãi tối đa"
                dataIndex="maxDiscountValue"
                key="maxDiscountValue"
                render={(text) => formatCurrency(text)}
              />
              <Column
                title="Trạng thái"
                key="status"
                render={(_voucher: VoucherDetail) => (
                  <Switch
                    defaultChecked={_voucher.status === DiscountStatus.ACTIVE}
                    onChange={() => {
                      const newStatus =
                        _voucher.status === DiscountStatus.ACTIVE
                          ? DiscountStatus.INACTIVE
                          : DiscountStatus.ACTIVE;
                      handleUpdateVoucherStatus(_voucher.id, newStatus);
                    }}
                  />
                )}
              />
              <Column
                title="Số lượng"
                dataIndex="usageLimit"
                key="usageLimit"
              />
              <Column
                title="Đã sử dụng"
                dataIndex="usedCount"
                key="usedCount"
              />
              <Column
                title="Hành động"
                key="action"
                render={(_voucher: VoucherDetail) => (
                  <Button
                    type="primary"
                    className={cx("btn-danger")}
                    disabled={isDisabled}
                    onClick={() =>
                      showConfirmDelete(() => handleDeleteVoucher(_voucher.id))
                    }
                  >
                    <DeleteOutlined />
                    Xóa
                  </Button>
                )}
              />
            </Table>
          </Space>
        </Space>
        {contextHolder}
      </Modal>
      <Modal
        width={600}
        destroyOnClose={true}
        title="Thêm giảm giá"
        open={showCreateDiscountModal}
        onCancel={handleCloseCreateDiscountModal}
        footer={[
          <Button onClick={handleCloseCreateDiscountModal} key={1}>
            Đóng
          </Button>,
          <Button
            type="primary"
            className={cx("btn")}
            onClick={handleCreateDiscount}
            key={2}
          >
            Tạo khuyến mãi
          </Button>,
        ]}
      >
        <Form
          form={discountForm}
          name="discount"
          layout="vertical"
          requiredMark="optional"
          className={cx("form")}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            name="type"
            label="Loại khuyến mãi"
            rules={[{ required: true, message: "Loại khuyến mãi là bắt buộc" }]}
            style={{ flex: 1 }}
          >
            <Select size="large" placeholder="Chọn loại khuyến mãi">
              <Option value="PERCENTAGE">Phần trăm</Option>
              <Option value="FIXED">Cố định</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="value"
            label="Giá trị"
            rules={[{ required: true, message: "Giá trị là bắt buộc" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="Nhập giá trị"
              prefix={prefix}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="appliedProductIds"
            label="Sản phẩm áp dụng"
            style={{ flex: 1 }}
          >
            <Select
              mode="multiple"
              size="large"
              showSearch
              filterOption={(input, option) =>
                ((option?.label as string) ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder="Chọn sản phẩm áp dụng"
              options={baseProducts.map((baseProduct) => ({
                value: baseProduct.id,
                label: baseProduct.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        width={600}
        destroyOnClose={true}
        title="Thêm phiếu mua hàng"
        open={showCreateVoucherModal}
        onCancel={handleCloseCreateVoucherModal}
        footer={[
          <Button onClick={handleCloseCreateVoucherModal} key={1}>
            Đóng
          </Button>,
          <Button
            type="primary"
            className={cx("btn")}
            onClick={handleCreateVoucher}
            key={2}
          >
            Tạo phiếu mua hàng
          </Button>,
        ]}
      >
        <Form
          form={voucherForm}
          name="discount"
          layout="vertical"
          requiredMark="optional"
          className={cx("form")}
          onValuesChange={handleVoucherFormValuesChange}
        >
          <Form.Item
            name="code"
            label="Mã phiếu mua hàng"
            rules={[
              { required: true, message: "Mã phiếu mua hàng là bắt buộc" },
            ]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập mã phiếu mua hàng" size="large" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại phiếu mua hàng"
            rules={[
              { required: true, message: "Loại phiếu mua hàng là bắt buộc" },
            ]}
            style={{ flex: 1 }}
          >
            <Select size="large" placeholder="Chọn loại phiếu mua hàng">
              <Option value="PERCENTAGE">Phần trăm</Option>
              <Option value="FIXED">Cố định</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="value"
            label="Giá trị"
            rules={[{ required: true, message: "Giá trị là bắt buộc" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="Nhập giá trị"
              prefix={prefix}
              min={0}
              max={maxValueVoucher}
            />
          </Form.Item>
          <Form.Item
            name="minOrderValue"
            label="Giá trị đơn hàng nhỏ nhất"
            rules={[
              {
                required: true,
                message: "Giá trị đơn hàng nhỏ nhất là bắt buộc",
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="Nhập giá trị đơn hàng nhỏ nhất"
              prefix={"VNĐ"}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="maxDiscountValue"
            label="Giá trị giảm tối đa"
            rules={[
              {
                required: true,
                message: "Giá trị giảm tối đa là bắt buộc",
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="Nhập giá trị giảm tối đa"
              prefix={"VNĐ"}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="usageLimit"
            label="Số lượng"
            rules={[
              {
                required: true,
                message: "Số lượng là bắt buộc",
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="Nhập số lượng"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
      {currentDiscount && (
        <Modal
          width={1000}
          destroyOnClose={true}
          title="Sản phẩm được giảm giá"
          open={showAppliedProductsModal}
          onCancel={() => {
            setCurrentDiscount(null);
            setShowAppliedProductsModal(false);
          }}
          footer={[
            <Button
              onClick={() => {
                setCurrentDiscount(null);
                setShowAppliedProductsModal(false);
              }}
              key={1}
            >
              Đóng
            </Button>,
          ]}
        >
          <Table
            dataSource={currentDiscount.appliedProducts}
            rowKey={(record) => record.id}
            loading={dataLoading}
            pagination={false}
          >
            <Column
              title="Id"
              dataIndex="id"
              key="id"
              sorter={(
                a: AppliedDiscountProduct,
                b: AppliedDiscountProduct
              ) => {
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
              render={(_baseProduct: AppliedDiscountProduct) => (
                <Switch
                  disabled
                  defaultChecked={_baseProduct.status === productStatus.ACTIVE}
                />
              )}
            />
          </Table>
        </Modal>
      )}
    </>
  );
};

export default PromotionDetailModal;
