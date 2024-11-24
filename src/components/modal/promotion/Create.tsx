import styles from "./Create.module.scss";
import classNames from "classnames/bind";

import { Button, DatePicker, Flex, Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { CreatePromotionRequest, Promotion } from "@/types/promotion";
import { createPromotion } from "@/services/promotion";
import day from "@/lib/day";

interface ICreatePromotionModal {
  value?: Promotion | null;
  open: boolean;
  onCancel: () => void;
  onFinish: (message: string) => void;
}

const cx = classNames.bind(styles);

const CreatePromotionModal: React.FC<ICreatePromotionModal> = ({
  value,
  open,
  onCancel,
  onFinish,
}) => {
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setTitle("Thêm đợt khuyến mãi");
    form.resetFields();
  }, [form]);

  useEffect(() => {
    if (value) {
      form.setFieldsValue({
        promotionName: value.name,
        startDate: value.startDate,
        endDate: value.startDate,
      });
    }
  }, [value, form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleFinish = (message: string) => {
    onFinish(message);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      const request: CreatePromotionRequest = {
        name: values.promotionName,
        startDate: values.startDate,
        endDate: values.endDate,
      };
      const data = await createPromotion(request);
      if (data) {
        handleCancel();
        handleFinish("Tạo đợt khuyến thành công");
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
  };

  return (
    <Modal
      destroyOnClose={true}
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button onClick={handleCancel} key={1}>
          Hủy
        </Button>,
        <Button
          onClick={handleSubmit}
          className={cx("btn")}
          type="primary"
          key={2}
          loading={loading}
        >
          {title}
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
        <Form.Item
          name="promotionName"
          label="Tên đợt khuyến mãi"
          rules={[
            { required: true, message: "Tên đợt khuyến mãi là bắt buộc" },
          ]}
        >
          <Input placeholder="Tên đợt khuyến mãi" size="large" />
        </Form.Item>
        <Flex gap={16}>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Ngày bắt đầu là bắt buộc" }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: "100%" }} />
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
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Flex>
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default CreatePromotionModal;
