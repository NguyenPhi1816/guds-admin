"use client";
import styles from "./Order.module.scss";
import classNames from "classnames/bind";

import {
  Button,
  Flex,
  Form,
  Input,
  InputRef,
  message,
  Space,
  Switch,
  Table,
  TableColumnType,
  Typography,
} from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useRef, useState } from "react";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import Column from "antd/es/table/Column";
import { getAllUser, updateUserStatus } from "@/services/user";
import { ProfileResponse } from "@/types/user";
import { UserGender } from "@/constant/enum/userGender";
import { formatDate } from "@/formater/DateFormater";
import { UserRoles } from "@/constant/enum/userRoles";
import { AccountStatus } from "@/constant/enum/accountStatus";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/es/table/interface";
import { getAllOrder } from "@/services/order";
import { Order } from "@/types/order";
import { OrderStatus } from "@/constant/enum/orderStatus";
import OrderDetailModal from "@/components/modal/orderDetailModal/OrderDetailModal";

const cx = classNames.bind(styles);

const { Text } = Typography;

const CustomerPage = () => {
  const [data, setData] = useState<Order[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // search by order id
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Order[]>([]);

  // search on column
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res = await getAllOrder();
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
    if (data.length > 0) {
      const result = data.filter((item) => {
        return item.id.toString().includes(searchValue.toLowerCase());
      });
      setSearchResult(result);
    }
  }, [data, searchValue]);

  const handleRefresh = (message: string) => {
    setRefresh(true);
    if (message !== "") {
      messageApi.open({
        type: "success",
        content: message,
      });
    }
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof Order
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: keyof Order
  ): TableColumnType<Order> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const data = record[dataIndex];
      if (!data) {
        return false;
      }
      return data
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleOpenModal = (order: Order) => {
    setCurrentOrder(order);
    setOpenModal(true);
  };

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách Đơn hàng</Title>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Space>
              <Typography.Text>Tìm kiếm</Typography.Text>
              <Input
                placeholder="Mã Đơn hàng"
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
          width={75}
          {...getColumnSearchProps("id")}
        />
        <Column
          title="Họ tên"
          dataIndex="receiverName"
          key="receiverName"
          {...getColumnSearchProps("receiverName")}
        />
        <Column
          title="Số điện thoại"
          dataIndex="receiverPhoneNumber"
          key="receiverPhoneNumber"
          {...getColumnSearchProps("receiverPhoneNumber")}
        />
        <Column
          title="Địa chỉ"
          dataIndex="receiverAddress"
          key="receiverAddress"
          ellipsis={true}
          render={(receiverAddress: string) => (
            <Text title={receiverAddress}>{receiverAddress}</Text>
          )}
          {...getColumnSearchProps("receiverAddress")}
        />
        <Column
          title="Ghi chú"
          dataIndex="note"
          key="note"
          ellipsis={true}
          render={(note: string) => <Text title={note}>{note}</Text>}
        />
        <Column
          title="Ngày đặt hàng"
          dataIndex="createAt"
          key="createAt"
          render={(createAt: string) => <Text>{formatDate(createAt)}</Text>}
        />
        <Column
          title="Trạng thái"
          key="status"
          dataIndex="status"
          render={(status: string) => {
            switch (status) {
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
          }}
        />
        <Column
          title="Hành động"
          key="action"
          render={(order: Order) => (
            <Button
              className={cx("btn")}
              type="primary"
              onClick={() => handleOpenModal(order)}
            >
              <EyeOutlined />
              Chi tiết
            </Button>
          )}
        />
      </Table>
      {currentOrder && (
        <OrderDetailModal
          open={openModal}
          data={currentOrder}
          onCancel={handleCancel}
          onRefresh={handleRefresh}
        />
      )}
      {contextHolder}
    </div>
  );
};

export default CustomerPage;
