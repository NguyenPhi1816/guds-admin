import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Card, DatePicker, Space, Spin } from "antd";
import day from "@/lib/day";
import {
  GetProductStatisticsRequest,
  GetProductStatisticsResponse,
  PriceChangeStatisticsRequest,
  PriceChangeStatisticsResponse,
} from "@/types/statistics";
import dayjs, { Dayjs } from "dayjs";
import {
  getProductStatistics,
  priceChangeStatistics,
} from "@/services/statistics";

interface IPriceChangeChart {
  productId: number;
}

const PriceChangeChart: React.FC<IPriceChangeChart> = ({ productId }) => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [data, setData] = useState<PriceChangeStatisticsResponse[] | null>();
  const [options, setOptions] = useState<any>();

  useEffect(() => {
    handleWeekClick();
  }, []);

  useEffect(() => {
    async function fetcher() {
      if (dateRange && dateRange[0] && dateRange[1]) {
        const request: PriceChangeStatisticsRequest = {
          baseProductId: productId,
          fromDate: dateRange[0].format("YYYY-MM-DD"),
          toDate: dateRange[1].format("YYYY-MM-DD"),
        };
        const response = await priceChangeStatistics(request);
        setData(response);

        // Chuẩn bị dữ liệu cho ECharts
        const seriesData = response.map((variant) => {
          return {
            name: `Tùy chọn: ${variant.optionValue}`,
            type: "line",
            data: variant.prices.map((priceData) => [
              day(priceData.createdAt).format("DD-MM-YYYY HH:mm:ss"),
              priceData.price,
            ]),
          };
        });

        // Cấu hình cho biểu đồ
        const options = {
          title: {
            text: "Biểu đồ biến đổi giá của Product Variants",
            left: "center",
          },
          tooltip: {
            trigger: "axis",
          },
          legend: {
            data: response.map((variant) => `Tùy chọn: ${variant.optionValue}`),
            top: "7%",
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            name: "Thời gian",
            axisLabel: {
              rotate: 30,
            },
          },
          yAxis: {
            type: "value",
            name: "Giá (VND)",
          },
          series: seriesData,
        };
        setOptions(options);
      }
    }

    fetcher();
  }, [productId, dateRange]);

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

  const handleThreeMonthClick = () => {
    const today = dayjs();
    const lastMonth = today.subtract(90, "day"); // 30 ngày trước
    setDateRange([lastMonth, today]); // Cập nhật dateRange là 30 ngày gần nhất
  };

  return (
    <Card
      title="Biểu Đồ Thể Hiện Sự Biến Đổi Về Giá Của Một Sản Phẩm"
      style={{ margin: "0 auto" }}
    >
      <Space style={{ width: "100%", marginBottom: 16 }}>
        <Space>
          <Button onClick={handleWeekClick}>Tuần</Button>
          <Button onClick={handleMonthClick}>Tháng</Button>
          <Button onClick={handleThreeMonthClick}>3 Tháng</Button>
        </Space>
        {/* DatePicker */}
        <DatePicker.RangePicker value={dateRange} onChange={handleDateChange} />
      </Space>
      {options ? (
        <ReactECharts
          option={options}
          style={{ width: "800px", height: "400px" }}
        />
      ) : (
        <Spin tip="Đang tải dữ liệu">
          <div></div>
        </Spin>
      )}
    </Card>
  );
};

export default PriceChangeChart;
