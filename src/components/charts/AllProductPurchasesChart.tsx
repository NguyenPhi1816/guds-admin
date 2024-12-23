import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Card, DatePicker, message, Select, Space, Spin } from "antd";
import day from "@/lib/day";
import {
  GetProductStatisticsResponse,
  GetPurchasesStatisticsRequest,
} from "@/types/statistics";
import dayjs, { Dayjs } from "dayjs";
import { getPurchasesStatistics } from "@/services/statistics";
import { getAllProduct } from "@/services/product";
import { BaseProduct } from "@/types/product";
import { FileExcelFilled, FileExcelOutlined } from "@ant-design/icons";
import { exportSalesReport } from "@/services/products-client";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AllProductPurchasesChart = () => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [data, setData] = useState<GetProductStatisticsResponse[] | null>();
  const [options, setOptions] = useState<any>();
  const [messageApi, contextHolder] = message.useMessage();
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

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

  useEffect(() => {
    handleMonthClick();
  }, []);

  useEffect(() => {
    async function fetcher() {
      if (dateRange && dateRange[0] && dateRange[1]) {
        const request: GetPurchasesStatisticsRequest = {
          baseProductIds: selectedProducts,
          fromDate: dateRange[0].format("YYYY-MM-DD"),
          toDate: dateRange[1].format("YYYY-MM-DD"),
        };
        const response = await getPurchasesStatistics(request);
        setData(response);

        const options = {
          title: {
            text: "Tổng số lượt mua sản phẩm",
            left: "center",
            textStyle: {
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
            },
          },
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
          },
          xAxis: {
            type: "category",
            data: response.map((item) => day(item.date).format("DD-MM-YYYY")),
            axisLabel: {
              rotate: 30,
            },
          },
          yAxis: {
            type: "value",
            name: "Lượt mua",
          },
          series: [
            {
              name: "Lượt mua",
              type: "bar",
              data: response.map((item) => item.count),
              itemStyle: {
                color: "#edcf5d",
              },
            },
          ],
        };
        setOptions(options);
      }
    }

    fetcher();
  }, [dateRange, selectedProducts]);

  // Hàm cập nhật dateRange khi chọn khoảng thời gian
  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  // Hàm xử lý chọn "Tuần" (7 ngày gần nhất)
  const handleWeekClick = () => {
    const today = dayjs();
    const lastWeek = today.subtract(7, "day"); // 7 ngày trước
    setDateRange([lastWeek, today]); // Cập nhật dateRange là 7 ngày gần nhất
  };

  // Hàm xử lý chọn "Tháng" (30 ngày gần nhất)
  const handleMonthClick = () => {
    const today = dayjs();
    const lastMonth = today.subtract(30, "day"); // 30 ngày trước
    setDateRange([lastMonth, today]); // Cập nhật dateRange là 30 ngày gần nhất
  };

  const handleExportExcel = async () => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const dataExcel = await exportSalesReport(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD")
      );

      if (dataExcel) {
        // Tạo workbook và worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Report");

        // Định nghĩa tiêu đề cột
        worksheet.columns = [
          { header: "STT", key: "index", width: 10 },
          { header: "Mã nhóm sản phẩm", key: "baseProductCode", width: 15 },
          { header: "Tên nhóm sản phẩm", key: "baseProductName", width: 50 },
          {
            header: "Mã biến thể sản phẩm",
            key: "productVariantCode",
            width: 15,
          },
          {
            header: "Tên biến thể sản phẩm",
            key: "optionValueName",
            width: 50,
          },
          { header: "Số lượng bán", key: "quantitySold", width: 15 },
          { header: "Tổng tiền", key: "totalAmount", width: 20 },
        ];

        // Thêm dữ liệu vào worksheet
        dataExcel.forEach((item) => {
          worksheet.addRow(item);
        });

        // Tạo file Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // Lưu file
        saveAs(
          new Blob([buffer]),
          `bao_cao_doanh_thu_${dateRange[0].format(
            "YYYY-MM-DD"
          )}_${dateRange[1].format("YYYY-MM-DD")}.xlsx`
        );
      }
    }
  };

  return (
    <Card
      title="Biểu Đồ Tổng Số Lượt Mua Sản Phẩm"
      style={{ margin: "0 auto", width: "100%" }}
    >
      <Space style={{ width: "100%", marginBottom: 16 }}>
        <Space>
          <Button onClick={handleWeekClick}>Tuần</Button>
          <Button onClick={handleMonthClick}>Tháng</Button>
        </Space>
        {/* DatePicker */}
        <DatePicker.RangePicker value={dateRange} onChange={handleDateChange} />
        <Select
          style={{ width: 500 }}
          mode="multiple"
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
          onChange={(value: number[]) => setSelectedProducts(value)}
        />
        <Button onClick={handleExportExcel}>
          <FileExcelOutlined />
          Xuất Excel
        </Button>
      </Space>
      <div style={{ padding: "48px 24px" }}>
        {options ? (
          <ReactECharts
            option={options}
            style={{ width: "100%", height: "400px" }}
          />
        ) : (
          <Spin tip="Đang tải dữ liệu">
            <div></div>
          </Spin>
        )}
      </div>
    </Card>
  );
};

export default AllProductPurchasesChart;
