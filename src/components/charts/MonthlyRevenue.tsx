"use client";
import { formatCurrency } from "@/formater/CurrencyFormater";
import { getMonthlyRevenue } from "@/services/revenue";
import { message, Space, Typography, Select } from "antd";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LabelList,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Text } = Typography;
const { Option } = Select;

const CustomTooltip = ({ payload, label }: any) => {
  if (!payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <Space
      direction="vertical"
      style={{
        padding: "1rem",
        backgroundColor: "var(--white)",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        borderRadius: "0.5rem",
      }}
    >
      <Space>
        <Text strong>Tháng: </Text>
        <Text>{data.month}</Text>
      </Space>
      <Space>
        <Text strong>Doanh thu: </Text>
        <Text>{formatCurrency(data.revenue)}</Text>
      </Space>
    </Space>
  );
};

const CustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          style={{ margin: "0 10px", display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              marginRight: 5,
              borderRadius: "50%",
            }}
          />
          <Text strong>{entry.value}</Text>
        </div>
      ))}
    </div>
  );
};

const MonthlyRevenue = () => {
  const [data, setData] = useState<{ month: number; revenue: number }[]>([]);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const handleYearChange = (value: string) => {
    setYear(value);
  };

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await getMonthlyRevenue(year);
        if (res) {
          setData(res);
        }
      } catch (error) {
        if (error instanceof Error) {
          message.open({
            type: "error",
            content: error.message,
          });
        }
      }
    };
    fetcher();
  }, [year]);

  // Custom formatter to hide labels for 0 values
  const labelFormatter = (value: number) => {
    return value === 0 ? "" : formatCurrency(value);
  };

  // Custom tick formatter for YAxis to format currency
  const tickFormatter = (value: number) => {
    return formatCurrency(value);
  };

  // Generate an array of years from 2020 to the current year
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  return (
    <div style={{ textAlign: "center" }}>
      <Space align="center" style={{ marginBottom: "1rem" }}>
        <Text strong>Chọn năm</Text>
        <Select defaultValue={year} size="large" onChange={handleYearChange}>
          {years.map((year) => (
            <Option key={year} value={year.toString()}>
              {year}
            </Option>
          ))}
        </Select>
      </Space>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          width={700}
          height={500}
          data={data}
          margin={{
            top: 40, // Increase top margin to avoid overlap with XAxis label
            right: 30,
            left: 100, // Increase left margin to avoid overlap with YAxis label
            bottom: 50, // Increase bottom margin for XAxis label
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{
              value: "Tháng",
              position: "insideBottomRight",
              offset: -10,
            }}
          />
          <YAxis
            tickFormatter={tickFormatter}
            label={{
              value: "Doanh thu",
              angle: -90,
              position: "insideLeft",
              offset: -50, // Adjust offset to ensure the label is visible
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="revenue"
            fill="#8884d8"
            activeBar={<Rectangle fill="#edcf5d" />}
          >
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={labelFormatter}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyRevenue;
