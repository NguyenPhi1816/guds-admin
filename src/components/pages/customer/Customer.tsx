"use client";
import styles from "./Customer.module.scss";
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
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import Column from "antd/es/table/Column";
import { getAllUser, updateUserStatus } from "@/services/user";
import { ProfileResponse } from "@/types/user";
import { UserGender } from "@/constant/enum/userGender";
import { formatDate } from "@/formater/DateFormater";
import { UserRoles } from "@/constant/enum/userRoles";
import { AccountStatus } from "@/constant/enum/accountStatus";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/es/table/interface";

const cx = classNames.bind(styles);

const { Text } = Typography;

const CustomerPage = () => {
  const [data, setData] = useState<ProfileResponse[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<ProfileResponse[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetcher = async () => {
      try {
        setIsLoading(true);
        const res = await getAllUser();
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

  const handleUpdateStatus = async (id: number, status: AccountStatus) => {
    try {
      await updateUserStatus({ userId: id, status });
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      }
    }
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof ProfileResponse
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
    dataIndex: keyof ProfileResponse
  ): TableColumnType<ProfileResponse> => ({
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

  return (
    <div className={cx("wrapper")}>
      <Title>Danh sách Khách hàng</Title>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Space>
              <Typography.Text>Tìm kiếm</Typography.Text>
              <Input
                placeholder="Mã khách hàng"
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
          title="Họ và tên đệm"
          dataIndex="firstName"
          key="firstName"
          {...getColumnSearchProps("firstName")}
        />
        <Column
          title="Tên"
          dataIndex="lastName"
          key="lastName"
          {...getColumnSearchProps("firstName")}
        />
        <Column
          title="Địa chỉ"
          dataIndex="address"
          key="address"
          ellipsis={true}
          render={(address: string) => <Text title={address}>{address}</Text>}
          {...getColumnSearchProps("address")}
        />
        <Column
          title="Số điện thoại"
          dataIndex="phoneNumber"
          key="phoneNumber"
          {...getColumnSearchProps("phoneNumber")}
        />
        <Column
          title="Giới tính"
          dataIndex="gender"
          key="gender"
          render={(gender: string) => (
            <Text>{gender === UserGender.MALE ? "Nam" : "Nữ"}</Text>
          )}
        />
        <Column
          title="Ngày sinh"
          dataIndex="dateOfBirth"
          key="dateOfBirth"
          render={(dateOfBirth: string) => (
            <Text>{formatDate(dateOfBirth)}</Text>
          )}
        />
        <Column
          title="Email"
          dataIndex="email"
          key="email"
          ellipsis={true}
          render={(email: string) => <Text title={email}>{email}</Text>}
          {...getColumnSearchProps("email")}
        />
        <Column
          title="Vai trò"
          dataIndex="role"
          key="role"
          render={(role: string) => (
            <Text>
              {role === UserRoles.ADMIN ? "Quản trị viên" : "Khách hàng"}
            </Text>
          )}
        />
        <Column
          title="Trạng thái"
          key="status"
          render={(user: ProfileResponse) => (
            <Switch
              defaultChecked={user.status === AccountStatus.ACTIVE}
              onClick={() =>
                handleUpdateStatus(
                  user.id,
                  user.status === AccountStatus.ACTIVE
                    ? AccountStatus.INACTIVE
                    : AccountStatus.ACTIVE
                )
              }
            />
          )}
        />
      </Table>
      {contextHolder}
    </div>
  );
};

export default CustomerPage;
