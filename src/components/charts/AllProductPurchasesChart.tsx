import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Card, DatePicker, Space, Spin } from "antd";
import day from "@/lib/day";
import {
  GetProductStatisticsResponse,
  GetPurchasesStatisticsRequest,
} from "@/types/statistics";
import dayjs, { Dayjs } from "dayjs";
import { getPurchasesStatistics } from "@/services/statistics";

const AllProductPurchasesChart = () => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [data, setData] = useState<GetProductStatisticsResponse[] | null>();
  const [options, setOptions] = useState<any>();

  useEffect(() => {
    handleWeekClick();
  }, []);

  useEffect(() => {
    async function fetcher() {
      if (dateRange && dateRange[0] && dateRange[1]) {
        const request: GetPurchasesStatisticsRequest = {
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
              fontFamily: "Inter, sans-serif", // Thay đổi font chữ ở đây
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
  }, [dateRange]);

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
