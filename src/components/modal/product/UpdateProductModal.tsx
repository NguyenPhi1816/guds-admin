import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import {
  Badge,
  Button,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  UploadProps,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  AddBPImage,
  BaseProductDetailAdmin,
  BaseProductDetailImage,
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  InventoryLog,
  OptionValuesRequest,
  OptionValuesResponse,
  UpdateBaseProductRequest,
  UpdateProductVariantRequest,
  ValuesResponse,
} from "@/types/product";
import {
  createInventoryLog,
  createOptionValues,
  createProductVariant,
  deleteBaseProductImage,
  getBaseProductBySlug,
  getInventoryLog,
  updateBaseProduct,
  updateProductMainImage,
} from "@/services/product";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  InboxOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { CategoryResponse } from "@/types/category";
import { Brand } from "@/types/brand";
import ImageUpload from "@/components/upload";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import {
  addBPImage,
  createBaseProduct,
  updateProductVariant,
} from "@/services/products-client";
import { getAllCategory } from "@/services/category";
import { getAllBrand } from "@/services/brand";
import Column from "antd/es/table/Column";
import { formatCurrency } from "@/formater/CurrencyFormater";
import day from "@/lib/day";

const { confirm } = Modal;
const { Dragger } = Upload;

interface IUpdateProductModal {
  open: boolean;
  slug: string;
  onCancel: () => void;
}

export type Variant = {
  id: number;
  image: File | null;
  imageUrl: string;
  imageId: string;
  quantity: number;
  price: number;
  optionValues: string[];
};

const cx = classNames.bind(styles);

const UpdateProductModal: React.FC<IUpdateProductModal> = ({
  open,
  slug,
  onCancel,
}) => {
  const disable = true;
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [form] = Form.useForm();
  const [formUpdateQuantity] = Form.useForm();
  const [data, setData] = useState<BaseProductDetailAdmin>();
  const [baseProductId, setBaseProductId] = useState<number>();
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [baseProductImages, setBaseProductImages] = useState<File[]>([]);
  const [baseProductImageUrls, setBaseProductImageUrls] = useState<
    BaseProductDetailImage[]
  >([]);
  const [mainImageId, setMainImageId] = useState<number>(0);
  const [option, setOption] = useState<OptionValuesRequest[]>([]);
  const [valueArr, setValueArr] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editVariantIndex, setEditVariantIndex] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [BPLoading, setBPLoading] = useState<boolean>(false);
  const [openInventoryModal, setOpenInventoryModal] = useState<boolean>(false);
  const [currentProductVariantId, setCurrentProductVariantId] =
    useState<number>(-1);
  const [oldQuantity, setOldQuantity] = useState<number>(0);
  const [showInventoryLogsModal, setShowInventoryLogsModal] =
    useState<boolean>(false);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

  // Load categories and brands from database
  useEffect(() => {
    const fetcher = async () => {
      const promises = [getAllCategory(), getAllBrand()];
      const [_categories, _brands] = await Promise.all(promises);
      setCategories(_categories as CategoryResponse[]);
      setBrands(_brands as Brand[]);
    };
    fetcher();
  }, []);

  useEffect(() => {
    const fetcher = async (slug: string) => {
      try {
        const data: BaseProductDetailAdmin = await getBaseProductBySlug(slug);
        setData(data);
        setBaseProductId(data.id);
        setName(data.name);
        setDesc(data.description);
        setCategoryIds(data.categoryIds);
        setBrandId(data.brandId);
        setBaseProductImageUrls(data.images);

        const mainImageId = data.images.find((item) => item.isDefault)?.id;
        if (mainImageId) {
          setMainImageId(mainImageId);
        }

        setOption(data.optionValues);
        setVariants(
          data.productVariants.map((variant) => ({
            id: variant.id,
            imageUrl: variant.image,
            optionValues: variant.optionValue.map((opval) => opval.value),
            image: null,
            imageId: variant.imageId,
            price: variant.price,
            quantity: variant.quantity,
          }))
        );
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message);
        }
      }
    };
    if (slug) {
      fetcher(slug);
    }
  }, [slug]);

  useEffect(() => {
    form.setFieldsValue({
      name,
      category: categoryIds,
      brand: brandId,
      desc,
      images: baseProductImageUrls.map((item) => item.path),
    });
  }, [name, categoryIds, brandId, desc, baseProductImageUrls, form]);

  const handleCancel = () => {
    confirm({
      title: "Đóng cửa sổ thêm sản phẩm",
      icon: <ExclamationCircleFilled />,
      content:
        "Bạn có muốn đóng cửa không? Nếu có, dữ liệu trong cửa sổ sẽ biến mất",
      okText: "Đóng",
      okType: "danger",
      cancelText: "Không",
      onOk() {
        setName("");
        setDesc("");
        setCategoryIds([]);
        setBaseProductImages([]);
        setBrandId(undefined);
        setOption([]);
        setVariants([]);
        setValueArr([]);
        onCancel();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleCancelWithoutConfirm = () => {
    setName("");
    setDesc("");
    setCategoryIds([]);
    setBaseProductImages([]);
    setBrandId(undefined);
    setOption([]);
    setVariants([]);
    setValueArr([]);
    onCancel();
  };

  // Handle base product images

  let uploadTimeout: any; // Đặt một biến toàn cục để theo dõi trạng thái timeout

  const props: UploadProps = {
    name: "file",
    multiple: true,
    beforeUpload: (file) => {
      return false; // Ngăn việc upload tự động
    },
    onChange: async (e) => {
      // Nếu đã có timeout trước đó, clear nó để tránh việc upload quá sớm
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }

      // Đặt một timeout để đợi tất cả các tệp được thêm vào
      uploadTimeout = setTimeout(async () => {
        const files = e.fileList
          .map((fileItem) => fileItem.originFileObj as File)
          .filter((file): file is File => !!file);

        if (files.length > 0) {
          await handleUploadImage(files); // Upload tất cả tệp cùng một lúc
          e.fileList.length = 0; // Reset fileList
        }

        // Clear timeout sau khi xử lý xong
        uploadTimeout = null;
      }, 300); // Đợi 300ms để tất cả các tệp được thêm vào danh sách
    },
    showUploadList: false,
  };

  const handleUploadImage = async (files: File[]) => {
    if (baseProductId) {
      const request: AddBPImage = {
        baseProductId: baseProductId,
        images: files,
      };
      const newImages: BaseProductDetailImage[] = await addBPImage(request);
      setBaseProductImageUrls((prev) => [...prev, ...newImages]);
    }
  };

  const handleDeleteImages = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    index: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    confirm({
      title: "Xóa hình ảnh?",
      icon: <ExclamationCircleFilled />,
      content: "Bạn chắc chắn muốn xóa hình ảnh này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        e.preventDefault();
        e.stopPropagation();

        if (baseProductImageUrls[index].publicId === "") {
          // Cập nhật cả baseProductImages và baseProductImageUrls
          setBaseProductImages((prevImages) => {
            const newImages = prevImages.filter((item, idx) => idx !== index);
            return newImages;
          });
          setBaseProductImageUrls((prevUrls) => {
            const newUrls = prevUrls.filter((item, idx) => idx !== index);

            // Đảm bảo rằng mainImageId không vượt quá giới hạn của mảng mới
            setMainImageId((prevId) => {
              if (newUrls.length === 0) {
                return -1; // Nếu không còn hình ảnh nào, đặt về -1 hoặc giá trị mặc định
              }
              if (prevId >= newUrls.length) {
                return newUrls.length - 1; // Đặt về phần tử cuối cùng
              }
              return prevId; // Giữ nguyên nếu index hợp lệ
            });

            return newUrls;
          });
        } else {
          const publicId = baseProductImageUrls[index].publicId;
          await deleteBaseProductImage(publicId);
          setBaseProductImageUrls((prevUrls) => {
            const newUrls = prevUrls.filter((item, idx) => idx !== index);

            // Đảm bảo rằng mainImageId không vượt quá giới hạn của mảng mới
            setMainImageId((prevId) => {
              if (newUrls.length === 0) {
                return -1; // Nếu không còn hình ảnh nào, đặt về -1 hoặc giá trị mặc định
              }
              if (prevId >= newUrls.length) {
                return newUrls.length - 1; // Đặt về phần tử cuối cùng
              }
              return prevId; // Giữ nguyên nếu index hợp lệ
            });

            return newUrls;
          });
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleChangeMainImage = async (imageId: number) => {
    if (baseProductId) {
      setMainImageId(imageId);
      await updateProductMainImage(baseProductId, imageId);
    }
  };
  // End of Handle Option Values

  // Start of Handle Product Variant
  const handleVariantChange = (
    index: number,
    key: keyof Variant,
    value: any
  ) => {
    setVariants((prev) => {
      prev[index] = { ...prev[index], [key]: value };
      return prev;
    });
  };
  // End of Handle Product Variant

  const handleUpdateProduct = async () => {
    await form.validateFields().then(async () => {
      if (data && brandId) {
        const request: UpdateBaseProductRequest = {
          id: data.id,
          brandId: brandId,
          categoryIds: categoryIds,
          description: desc,
          name: name,
        };

        try {
          setBPLoading(true);
          await updateBaseProduct(request);
          handleCancelWithoutConfirm();
        } catch (error) {
          if (error instanceof Error) {
            message.error(error.message);
          } else {
            message.error("Có lỗi xảy ra");
          }
        } finally {
          setBPLoading(false);
        }
      }
    });
  };

  const handleResetVariant = () => {
    if (data) {
      setVariants(
        data.productVariants.map((variant) => ({
          id: variant.id,
          imageUrl: variant.image,
          optionValues: variant.optionValue.map((opval) => opval.value),
          image: null,
          imageId: variant.imageId,
          price: variant.price,
          quantity: variant.quantity,
        }))
      );
      setEditVariantIndex(undefined);
    }
  };

  const handleEditVariant = async (id: number) => {
    try {
      setLoading(true);
      const variant = variants.find((item) => item.id === id);

      if (variant) {
        const data: UpdateProductVariantRequest = {
          productVariantId: variant.id,
          image: variant.image,
          imageUrl: variant.imageUrl,
          imageId: variant.imageId,
          price: variant.price,
          quantity: variant.quantity,
        };

        const newVariant = await updateProductVariant(data);

        setVariants((prev) => {
          const newValue = prev.filter((item) => item.id !== id);
          newValue.push({
            id: newVariant.id,
            image: null,
            imageId: newVariant.imageId,
            imageUrl: newVariant.image,
            optionValues: variant.optionValues,
            price: newVariant.price,
            quantity: newVariant.quantity,
          });
          return newValue;
        });

        setEditVariantIndex(undefined);
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInventoryModal = (
    currentProductVariantId: number,
    oldQuantity: number
  ) => {
    setCurrentProductVariantId(currentProductVariantId);
    setOldQuantity(oldQuantity);
    setOpenInventoryModal(true);
  };

  const handleCloseInventoryModal = () => {
    setCurrentProductVariantId(-1);
    setOldQuantity(0);
    setOpenInventoryModal(false);
  };

  const handleUpdateProductVariantQuantity = async () => {
    await formUpdateQuantity.validateFields().then(async (data) => {
      const inventoryLog = await createInventoryLog(data);
      setVariants((prev) => {
        const newValue = [...prev];
        const myVariant = newValue.find(
          (item) => item.id === inventoryLog.productVariantId
        );
        if (myVariant) {
          myVariant.quantity = inventoryLog.newQuantity;
        }
        return newValue;
      });
      handleCloseInventoryModal();
    });
  };

  const handleGetInventoryLog = async (productVariantId: number) => {
    const inventoryLogs = await getInventoryLog(productVariantId);
    setInventoryLogs(inventoryLogs);
    setShowInventoryLogsModal(true);
  };

  const handleCloseInventoryLogModal = () => {
    setShowInventoryLogsModal(false);
  };

  return (
    <>
      <Modal
        destroyOnClose={true}
        title={"Thêm sản phẩm"}
        open={open}
        onCancel={() => handleCancel()}
        footer={[]}
        className={cx("modal")}
        afterClose={() => form.resetFields()}
      >
        <Flex vertical>
          <Form
            form={form}
            name="UpdateProduct"
            layout="vertical"
            requiredMark="optional"
            className={cx("form")}
          >
            <Form.Item
              name="images"
              label="Hình ảnh"
              rules={[
                {
                  required: true,
                  validator: (_, value) =>
                    baseProductImages.length + baseProductImageUrls.length >= 2
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Vui lòng tải lên đủ 3 hình ảnh")
                        ),
                },
              ]}
            >
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
              <Space
                size={"middle"}
                style={{
                  marginTop: "16px",
                  padding: "16px 0",
                  width: "100%",
                  overflowX: "scroll",
                }}
              >
                {baseProductImageUrls.map((item, index) => {
                  if (mainImageId === item.id)
                    return (
                      <Badge.Ribbon
                        text="Ảnh chính"
                        color="#edcf5d"
                        key={item.id}
                      >
                        <div
                          className={cx("preview", "main")}
                          onClick={() => handleChangeMainImage(item.id)}
                        >
                          <img className={cx("preview-img")} src={item.path} />
                          <button className={cx("preview-btn")}>
                            <DeleteOutlined
                              style={{ color: "#f5222d" }}
                              onClick={(e) => handleDeleteImages(e, index)}
                            />
                          </button>
                        </div>
                      </Badge.Ribbon>
                    );
                  return (
                    <div
                      className={cx("preview")}
                      onClick={() => handleChangeMainImage(item.id)}
                      key={item.id}
                    >
                      <img className={cx("preview-img")} src={item.path} />
                      <button className={cx("preview-btn")}>
                        <DeleteOutlined
                          style={{ color: "#f5222d" }}
                          onClick={(e) => handleDeleteImages(e, index)}
                        />
                      </button>
                    </div>
                  );
                })}
              </Space>
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              initialValue={name}
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm" },
              ]}
            >
              <Input
                placeholder="Tên sản phẩm"
                size="large"
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Item>
            <Flex gap={16}>
              <Form.Item
                name="category"
                label="Danh mục sản phẩm"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  size="large"
                  mode="multiple"
                  allowClear
                  placeholder="Vui lòng chọn danh mục"
                  value={categoryIds}
                  onChange={(value) => {
                    setCategoryIds(value);
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.children || "") as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="brand"
                label="Nhãn hàng"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: "Vui lòng chọn nhãn hàng" },
                  {
                    validator: (_, value) => {
                      if (value === -1) {
                        return Promise.reject(
                          new Error("Vui lòng chọn một nhãn hàng hợp lệ")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Vui lòng chọn nhãn hàng"
                  onChange={(value) => setBrandId(value)}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.children || "") as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  <Select.Option value={-1} disabled>
                    Chọn một nhãn hàng
                  </Select.Option>
                  {brands.map((brand) => (
                    <Select.Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Flex>
            <Form.Item name="option-value" label="Tùy chọn - giá trị tùy chọn">
              <Flex vertical>
                <Space direction="vertical">
                  {option.length > 0 &&
                    option.map((item, optionIndex) => (
                      <div key={optionIndex}>
                        <Flex gap={16} align="center">
                          <Input
                            style={{ flex: 1 }}
                            disabled={disable}
                            placeholder="Vui lòng nhập tùy chọn"
                            size="large"
                            defaultValue={item.option}
                          />
                          <Flex className={cx("tags-input")} align="center">
                            {item.values.map((value, valueIndex) => (
                              <Tag
                                key={valueIndex}
                                style={{ height: "fit-content" }}
                              >
                                {value}
                              </Tag>
                            ))}
                            <Input
                              variant="borderless"
                              className="borderless-tags-input"
                              disabled={disable}
                              placeholder="Vui lòng nhập giá trị"
                              size="large"
                              value={valueArr[optionIndex]}
                              onChange={(e) =>
                                setValueArr((prev) => {
                                  const newValueArr = [...prev];
                                  newValueArr[optionIndex] =
                                    e.currentTarget.value;
                                  return newValueArr;
                                })
                              }
                            />
                          </Flex>
                        </Flex>
                        <Divider />
                      </div>
                    ))}
                </Space>
              </Flex>
            </Form.Item>
            {variants.map((variant, index) => {
              const valuesStr =
                variant.optionValues.length === 0
                  ? "Mặc định"
                  : variant.optionValues.join(", ");
              return (
                <Form.Item
                  key={Math.random()}
                  name={`variant-${index}`}
                  label={`Tùy chọn: ${valuesStr}`}
                  rules={[
                    {
                      required: true,
                      validator: (_, value) =>
                        variants[index] != null
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Vui lòng tải lên đủ 3 hình ảnh")
                            ),
                    },
                  ]}
                >
                  <Flex gap={16} align="center">
                    <ImageUpload
                      disabled={editVariantIndex !== index}
                      defaultValue={variant.imageUrl}
                      onChange={(file, url) => {
                        handleVariantChange(index, "image", file);
                        handleVariantChange(index, "imageUrl", url);
                      }}
                    />
                    <InputNumber
                      disabled={editVariantIndex !== index}
                      defaultValue={variant.price}
                      controls={false}
                      min={1000}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ flex: 3, height: "40px", padding: "4px 0" }}
                      onChange={(value) =>
                        handleVariantChange(index, "price", value)
                      }
                      placeholder="Giá sản phẩm"
                    />
                    <InputNumber
                      disabled={true}
                      defaultValue={variant.quantity}
                      controls
                      min={0}
                      style={{ flex: 1, height: "40px", padding: "4px 0" }}
                      onChange={(value) =>
                        handleVariantChange(index, "quantity", value)
                      }
                      placeholder="Số lượng sản phẩm"
                    />
                    {editVariantIndex === index ? (
                      <>
                        <Button
                          loading={loading}
                          type="primary"
                          style={{ width: "fit-content" }}
                          onClick={() =>
                            handleOpenInventoryModal(
                              variant.id,
                              variant.quantity
                            )
                          }
                        >
                          <SaveOutlined />
                          Cập nhật tồn kho
                        </Button>
                        <Button
                          loading={loading}
                          type="primary"
                          style={{ width: "fit-content" }}
                          onClick={() => handleEditVariant(variant.id)}
                        >
                          <SaveOutlined />
                          Lưu
                        </Button>
                        <Button
                          type="primary"
                          danger
                          style={{ width: "fit-content" }}
                          onClick={handleResetVariant}
                        >
                          <CloseCircleOutlined />
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          loading={loading}
                          type="primary"
                          style={{ width: "fit-content" }}
                          onClick={() => handleGetInventoryLog(variant.id)}
                        >
                          <SaveOutlined />
                          Lịch sử tồn kho
                        </Button>
                        <Button
                          disabled={editVariantIndex !== undefined}
                          style={{ width: "fit-content" }}
                          onClick={() => setEditVariantIndex(index)}
                        >
                          <EditOutlined />
                          Chỉnh sửa
                        </Button>
                      </>
                    )}
                  </Flex>
                  <Divider />
                </Form.Item>
              );
            })}
            <Form.Item
              name="desc"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <ReactQuill
                className={cx("quill")}
                theme="snow"
                placeholder="Vui lòng nhập mô tả"
                onChange={(value) => setDesc(value)}
              />
            </Form.Item>
          </Form>
          <Flex justify="end">
            <Space>
              <Button onClick={handleCancel} danger>
                Hủy
              </Button>
              <Button onClick={handleUpdateProduct} type="primary">
                Lưu sản phẩm
              </Button>
            </Space>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        destroyOnClose={true}
        title={"Cập nhật tồn kho cho sản phẩm"}
        open={openInventoryModal}
        onCancel={() => handleCloseInventoryModal()}
        footer={[
          <Button
            key={1}
            loading={loading}
            type="primary"
            style={{ width: "fit-content" }}
            onClick={() => handleUpdateProductVariantQuantity()}
          >
            <SaveOutlined />
            Lưu
          </Button>,
          <Button
            key={2}
            type="primary"
            danger
            style={{ width: "fit-content" }}
            onClick={() => handleCloseInventoryModal()}
          >
            <CloseCircleOutlined />
            Hủy
          </Button>,
        ]}
        afterClose={() => formUpdateQuantity.resetFields()}
      >
        <Form form={formUpdateQuantity} layout="vertical">
          <Form.Item
            name="productVariantId"
            label="Mã sản phẩm"
            initialValue={currentProductVariantId}
          >
            <InputNumber
              disabled
              placeholder="Mã sản phẩm"
              size="large"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            name="oldQuantity"
            label="Số lượng tồn kho cũ"
            initialValue={oldQuantity}
          >
            <InputNumber
              disabled
              placeholder="Số lượng tồn kho cũ"
              size="large"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            name="newQuantity"
            label="Số lượng tồn kho mới"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn kho mới" },
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng tồn kho mới"
              style={{
                width: "100%",
              }}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="purchasePrice"
            label="Giá nhập"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              min={1000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              style={{
                width: "100%",
              }}
              placeholder="Nhập giá nhập"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        destroyOnClose={true}
        title={"Lịch sử cập nhật tồn kho"}
        open={showInventoryLogsModal}
        onCancel={() => handleCloseInventoryLogModal()}
        footer={[
          <Button onClick={() => handleCloseInventoryLogModal()} key={1}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Table
          dataSource={inventoryLogs}
          rowKey={(record) => record.id}
          pagination={false}
        >
          <Column
            title="Id"
            dataIndex="id"
            key="id"
            sorter={(a: InventoryLog, b: InventoryLog) => {
              return a.id - b.id;
            }}
          />
          <Column
            title="Số lượng tồn cũ"
            dataIndex="oldQuantity"
            key="oldQuantity"
          />
          <Column
            title="Số lượng tồn mới"
            dataIndex="newQuantity"
            key="newQuantity"
          />
          <Column
            title="Trạng thái"
            dataIndex="purchasePrice"
            key="purchasePrice"
            render={(purchasePrice: number) => {
              return formatCurrency(purchasePrice);
            }}
          />
          <Column
            title="Ngày cập nhật"
            dataIndex="changedAt"
            key="changedAt"
            render={(changedAt: string) => {
              return day(changedAt).format("DD-MM-YYYY");
            }}
          />
        </Table>
      </Modal>
    </>
  );
};

export default UpdateProductModal;
