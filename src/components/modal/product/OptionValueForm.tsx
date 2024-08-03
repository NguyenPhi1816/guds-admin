import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Input, message, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { OptionValuesRequest } from "@/types/product";

const { Title } = Typography;

interface IOptionValueForm {
  disable: boolean;
  defaultValue: OptionValuesRequest[];
  onChange: (optionValues: OptionValuesRequest[]) => void;
}

const cx = classNames.bind(styles);

const OptionValueForm: React.FC<IOptionValueForm> = ({
  disable,
  defaultValue,
  onChange,
}) => {
  const DEFAULT_OPTION_NAME = "Tùy chọn mới";
  const DEFAULT_VALUE_NAME = "Giá trị mới";
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [option, setOption] = useState<OptionValuesRequest[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setOption(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isChanged) {
      onChange(option);
      setIsChanged(false);
    }
  }, [option]);

  const handleCreateOption = () => {
    const defaultOptionExists = option.some(
      (item) => item.option === DEFAULT_OPTION_NAME
    );
    if (defaultOptionExists) {
      messageApi.error("Vui lòng nhập tùy chọn trước khi thêm tùy chọn mới");
      return;
    }
    setIsChanged(true);
    setOption((prev) => {
      const newItem: OptionValuesRequest = {
        option: DEFAULT_OPTION_NAME,
        values: [DEFAULT_VALUE_NAME],
      };
      return [...prev, newItem];
    });
  };

  const handleOptionNameChange = (index: number, value: string) => {
    setIsChanged(true);
    setOption((prev) => {
      const newOptions = [...prev];
      newOptions[index] = { ...newOptions[index], option: value };
      return newOptions;
    });
  };

  const handleRemoveOption = (optionName: string) => {
    setIsChanged(true);
    setOption((prev) => {
      return prev.filter((item) => item.option !== optionName);
    });
  };

  const handleCreateValue = (optionName: string) => {
    const defaultValueExists = option.some(
      (item) =>
        item.option === optionName && item.values.includes(DEFAULT_VALUE_NAME)
    );
    if (defaultValueExists) {
      messageApi.error("Vui lòng nhập giá trị trước khi thêm giá trị mới");
      return;
    }
    setIsChanged(true);
    setOption((prev) =>
      prev.map((item) =>
        item.option === optionName
          ? { ...item, values: [...item.values, DEFAULT_VALUE_NAME] }
          : item
      )
    );
  };

  const handleOptionValueChange = (
    optionIndex: number,
    valueIndex: number,
    value: string
  ) => {
    setIsChanged(true);
    setOption((prev) => {
      const newOptions = [...prev];
      newOptions[optionIndex].values[valueIndex] = value;
      return newOptions;
    });
  };

  const handleRemoveValue = (optionName: string, optionValue: string) => {
    setIsChanged(true);
    setOption((prev) => {
      return prev.map((item) =>
        item.option === optionName
          ? {
              ...item,
              values: item.values.filter((value) => value !== optionValue),
            }
          : item
      );
    });
  };

  return (
    <>
      <Flex className={cx("header")} justify="space-between" align="center">
        <Title level={5} className={cx("m-0")}>
          Tùy chọn
        </Title>
        <Button disabled={disable} onClick={handleCreateOption}>
          <PlusCircleOutlined />
          Thêm tùy chọn
        </Button>
      </Flex>
      <Space direction="vertical">
        {option.length > 0 &&
          option.map((item, optionIndex) => (
            <div key={optionIndex}>
              <Space>
                <Space>
                  <Input
                    disabled={disable}
                    placeholder="Tùy chọn"
                    size="large"
                    defaultValue={item.option}
                    onBlur={(e) =>
                      handleOptionNameChange(optionIndex, e.target.value)
                    }
                  />
                  <Button
                    disabled={disable}
                    shape="circle"
                    onClick={() => handleRemoveOption(item.option)}
                  >
                    <MinusCircleOutlined />
                  </Button>
                </Space>
                <Space>
                  <Space direction="vertical">
                    {item.values.map((value, valueIndex) => (
                      <Space key={valueIndex}>
                        <Input
                          disabled={disable}
                          key={valueIndex}
                          placeholder="Giá trị"
                          size="large"
                          defaultValue={value}
                          onBlur={(e) =>
                            handleOptionValueChange(
                              optionIndex,
                              valueIndex,
                              e.target.value
                            )
                          }
                        />
                        <Button
                          disabled={disable}
                          shape="circle"
                          onClick={() => handleRemoveValue(item.option, value)}
                        >
                          <MinusCircleOutlined />
                        </Button>
                      </Space>
                    ))}
                  </Space>
                  <Button
                    disabled={disable}
                    shape="circle"
                    onClick={() => handleCreateValue(item.option)}
                  >
                    <PlusCircleOutlined />
                  </Button>
                </Space>
              </Space>
              <Divider />
            </div>
          ))}
      </Space>
      {contextHolder}
    </>
  );
};

export default OptionValueForm;
