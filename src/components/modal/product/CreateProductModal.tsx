import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import { Button, Flex, Modal } from "antd";
import React, { useState } from "react";
import {
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  OptionValuesRequest,
  OptionValuesResponse,
  ValuesResponse,
} from "@/types/product";
import BaseProductForm from "./BaseProductForm";
import OptionValueForm from "./OptionValueForm";
import ProductVariantForm, { Variant } from "./ProductVariantForm";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { uploadImages } from "@/services/upload";
import {
  createBaseProduct,
  createOptionValues,
  createProductVariant,
} from "@/services/product";

const { confirm } = Modal;

enum ModalScreen {
  BASE_PRODUCT_SCREEN = 1,
  OPTION_VALUES_SCREEN = 2,
  PRODUCT_VARIANT_SCREEN = 3,
}

interface ICreateProductModal {
  open: boolean;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const CreateProductModal: React.FC<ICreateProductModal> = ({
  open,
  onCancel,
}) => {
  const INITIAL_BASE_PRODUCT: CreateBaseProductRequest = {
    name: "",
    description: "",
    brandId: -1,
    categoryIds: [],
    images: [],
  };

  const [screenIndex, setScreenIndex] = useState<number>(
    ModalScreen.BASE_PRODUCT_SCREEN
  );
  const [baseProduct, setBaseProduct] =
    useState<CreateBaseProductRequest>(INITIAL_BASE_PRODUCT);
  const [baseProductImages, setBaseProductImages] = useState<File[]>([]);
  const [option, setOption] = useState<OptionValuesRequest[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

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
        setScreenIndex(ModalScreen.BASE_PRODUCT_SCREEN);
        setBaseProduct(INITIAL_BASE_PRODUCT);
        setBaseProductImages([]);
        setOption([]);
        setVariants([]);
        onCancel();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleCancelWithoutConfirm = () => {
    setScreenIndex(ModalScreen.BASE_PRODUCT_SCREEN);
    setBaseProduct(INITIAL_BASE_PRODUCT);
    setBaseProductImages([]);
    setOption([]);
    setVariants([]);
    onCancel();
  };

  const nextScreen = () => {
    setScreenIndex((prev) => {
      const newValue = prev + 1;
      if (newValue > ModalScreen.PRODUCT_VARIANT_SCREEN) {
        return ModalScreen.PRODUCT_VARIANT_SCREEN;
      }
      return newValue;
    });
  };

  const prevScreen = () => {
    setScreenIndex((prev) => {
      const newValue = prev - 1;
      if (newValue < ModalScreen.BASE_PRODUCT_SCREEN) {
        return ModalScreen.BASE_PRODUCT_SCREEN;
      }
      return newValue;
    });
  };

  const generateCombinations = (options: OptionValuesRequest[]): string[][] => {
    const results: string[][] = [];
    const generate = (current: string[], depth: number) => {
      if (depth === options.length) {
        results.push(current);
        return;
      }
      for (const value of options[depth].values) {
        generate([...current, value], depth + 1);
      }
    };
    generate([], 0);
    return results;
  };

  const handleSaveBaseProduct = (
    baseProduct: CreateBaseProductRequest,
    images: File[]
  ) => {
    setBaseProduct(baseProduct);
    setBaseProductImages(images);
    nextScreen();
  };

  const handleSaveOptionValue = (optionValues: OptionValuesRequest[]) => {
    setOption(optionValues);
    const allCombinations = generateCombinations(optionValues);
    const initialVariants: Variant[] = allCombinations.map((combination) => ({
      id: null,
      image: null,
      imageUrl: "",
      price: 1000,
      quantity: 1,
      optionValues: combination,
    }));
    setVariants(initialVariants);
    nextScreen();
  };

  const handleSaveProductVariant = async (variants: Variant[]) => {
    setVariants(variants);
    await handleCreateProduct();
  };

  const handleCreateProduct = async () => {
    let isValid = true;
    const { paths } = await uploadImages(baseProductImages as File[]);
    const createBaseProductRequest: CreateBaseProductRequest = {
      name: baseProduct.name,
      description: baseProduct.description,
      categoryIds: baseProduct.categoryIds,
      brandId: baseProduct.brandId,
      images: paths,
    };
    const newBaseProduct = await createBaseProduct(createBaseProductRequest);
    isValid = !!newBaseProduct;
    if (!isValid) {
      throw new Error("Có lỗi xảy ra trong quá trình thêm sản phẩm");
    }

    const createOptionValuesRequest: CreateOptionValueRequest = {
      baseProductId: newBaseProduct.id,
      optionValues: option,
    };

    const optionValuesResponse: OptionValuesResponse[] =
      await createOptionValues(createOptionValuesRequest);
    isValid = !!optionValuesResponse;
    if (!isValid) {
      throw new Error(
        "Có lỗi xảy ra trong quá trình thêm tùy chọn cho sản phẩm"
      );
    }
    const values: ValuesResponse[] = optionValuesResponse.reduce(
      (prev, curr) => [...prev, ...curr.values],
      [] as ValuesResponse[]
    );
    const productVariantImages: File[] = variants.map(
      (variant) => variant.image as File
    );
    const { paths: productVariantImagePaths } = await uploadImages(
      productVariantImages
    );
    const createProductVariantPromises = variants.map((variant, index) => {
      const _optionValueIds: number[] = [];
      for (let value of variant.optionValues) {
        const _myValue = values.find((v) => v.valueName === value);
        if (_myValue) {
          _optionValueIds.push(_myValue.valueId);
        }
      }
      const request: CreateProductVariantRequest = {
        baseProductId: newBaseProduct.id,
        image: productVariantImagePaths[index],
        optionValueIds: _optionValueIds,
        price: variant.price,
        quantity: variant.quantity,
      };
      return createProductVariant(request);
    });
    const productVariants = await Promise.all(createProductVariantPromises);
    isValid = !!productVariants;
    if (!isValid) {
      throw new Error("Có lỗi xảy ra trong quá trình thêm biến thể sản phẩm");
    }
    handleCancelWithoutConfirm();
  };

  return (
    <Modal
      destroyOnClose={true}
      title={"Thêm sản phẩm"}
      open={open}
      onCancel={() => handleCancel()}
      footer={[]}
      className={cx("modal")}
    >
      <Flex>
        {screenIndex === ModalScreen.BASE_PRODUCT_SCREEN && (
          <div className={cx("form-wrapper")}>
            <BaseProductForm
              value={baseProduct}
              imageFiles={baseProductImages}
              onSubmit={handleSaveBaseProduct}
              onCancel={handleCancel}
            />
          </div>
        )}
        {screenIndex === ModalScreen.OPTION_VALUES_SCREEN && (
          <div className={cx("form-wrapper")}>
            <OptionValueForm
              defaultValue={option}
              onSubmit={handleSaveOptionValue}
              onCancel={handleCancel}
              onGoBack={prevScreen}
            />
          </div>
        )}
        {screenIndex === ModalScreen.PRODUCT_VARIANT_SCREEN && (
          <div className={cx("form-wrapper")}>
            <ProductVariantForm
              defaultValue={variants}
              onSubmit={handleSaveProductVariant}
              onCancel={handleCancel}
              onGoBack={prevScreen}
            />
          </div>
        )}
      </Flex>
    </Modal>
  );
};

export default CreateProductModal;
