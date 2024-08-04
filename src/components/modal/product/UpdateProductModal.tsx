import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import { Flex, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { uploadImages } from "@/services/upload";
import {
  BaseProductDetail,
  CreateBaseProductRequest,
  OptionValuesRequest,
  ProductVariantResponse,
  UpdateBaseProductRequest,
  UpdateProductVariantRequest,
} from "@/types/product";
import {
  getBaseProductBySlug,
  updateBaseProduct,
  updateProductVariant,
} from "@/services/product";
import BaseProductForm, { BaseProductFormType } from "./BaseProductForm";
import OptionValueForm from "./OptionValueForm";
import ProductVariantForm, {
  ProductVariantFormType,
  Variant,
} from "./ProductVariantForm";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { confirm } = Modal;

enum ModalScreen {
  BASE_PRODUCT_SCREEN = 1,
  OPTION_VALUES_SCREEN = 2,
  PRODUCT_VARIANT_SCREEN = 3,
}

interface IUpdateProductModal {
  open: boolean;
  slug: string;
  onCancel: () => void;
}

const cx = classNames.bind(styles);

const UpdateProductModal: React.FC<IUpdateProductModal> = ({
  open,
  slug,
  onCancel,
}) => {
  const [screenIndex, setScreenIndex] = useState<number>(
    ModalScreen.BASE_PRODUCT_SCREEN
  );
  const [dataFromSlug, setDataFromSlug] = useState<BaseProductDetail | null>(
    null
  );
  const [baseProduct, setBaseProduct] =
    useState<CreateBaseProductRequest | null>(null);
  const [baseProductImages, setBaseProductImages] = useState<File[]>([]);
  const [option, setOption] = useState<OptionValuesRequest[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const fetcher = async (slug: string) => {
      try {
        const data: BaseProductDetail = await getBaseProductBySlug(slug);
        setDataFromSlug(data);
        const newBaseProduct: CreateBaseProductRequest = {
          name: data.name,
          description: data.description,
          images: data.images.map((image) => image.path),
          categoryIds: data.categories.map((category) => category.id),
          brandId: data.brand.id,
        };
        setBaseProduct(newBaseProduct);
        setOption(data.optionValues);
        setVariants(
          data.productVariants.map((variant) => ({
            id: variant.id,
            imageUrl: variant.image,
            optionValues: variant.optionValue.map((opval) => opval.value),
            image: null,
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
        setBaseProduct(null);
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
    setBaseProduct(null);
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

  const handleUpdateProduct = async () => {
    let isValid = true;
    isValid = !dataFromSlug;
    if (isValid) throw new Error("Có lỗi xảy ra");
    if (!baseProduct) throw new Error("Có lỗi xảy ra");
    isValid =
      !!baseProduct.name &&
      !!baseProduct.description &&
      !!baseProduct.brandId &&
      baseProduct.categoryIds.length > 0;
    if (!isValid) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }
    // update image by index
    const imagesAndIndexesToUpdate = baseProductImages
      .map((image, index) =>
        image !== null ? { image: image, index: index } : {}
      )
      .filter((image) => Object.keys(image).length !== 0);
    const imagesToUpdate = imagesAndIndexesToUpdate.map((i) => i.image as File);
    const { paths } = await uploadImages(imagesToUpdate);
    const pathsToUpdate = (dataFromSlug as BaseProductDetail).images.map(
      (i) => i.path
    );
    imagesAndIndexesToUpdate.map((imageAndIndex, index) => {
      pathsToUpdate[imageAndIndex.index as number] = paths[index];
    });
    // request
    const updateBaseProductRequest: UpdateBaseProductRequest = {
      id: (dataFromSlug as BaseProductDetail).id,
      name: baseProduct.name,
      description: baseProduct.description,
      categoryIds: baseProduct.categoryIds,
      brandId: baseProduct.brandId,
      images: pathsToUpdate,
    };
    const updatedBaseProduct = await updateBaseProduct(
      updateBaseProductRequest
    );
    isValid = !!updatedBaseProduct;
    if (!isValid) {
      throw new Error("Có lỗi xảy ra trong quá trình chỉnh sửa sản phẩm");
    }
    // update variant
    const updateVariantPromises: Promise<ProductVariantResponse>[] = [];
    // update variant if variant.image is not null
    const editedImageVariant = variants.filter(
      (variant) => variant.image !== null
    );
    const variantImagesToUpdate = editedImageVariant.map(
      (variant) => variant.image as File
    );
    const { paths: variantImagePaths } = await uploadImages(
      variantImagesToUpdate
    );
    editedImageVariant.map((variant, index) => {
      const request: UpdateProductVariantRequest = {
        productVariantId: variant.id as number,
        image: variantImagePaths[index],
        price: variant.price,
        quantity: variant.quantity,
      };
      updateVariantPromises.push(updateProductVariant(request));
    });
    // update variant if price or quantity change
    const remainVariant = variants.filter((variant) => variant.image === null);
    remainVariant.forEach((variant) => {
      const defaultVariant = (
        dataFromSlug as BaseProductDetail
      ).productVariants.find(
        (productVariant) => productVariant.id === variant.id
      );
      if (
        defaultVariant &&
        (variant.price !== defaultVariant?.price ||
          variant.quantity !== defaultVariant.quantity)
      ) {
        const request: UpdateProductVariantRequest = {
          productVariantId: variant.id as number,
          image: variant.imageUrl as string,
          price: variant.price,
          quantity: variant.quantity,
        };
        updateVariantPromises.push(updateProductVariant(request));
      }
    });
    // do update
    await Promise.all(updateVariantPromises);
    handleCancelWithoutConfirm();
  };

  const handleSaveBaseProduct = (
    baseProduct: CreateBaseProductRequest,
    images: File[]
  ) => {
    setBaseProduct(baseProduct);
    setBaseProductImages(images);
    console.log("hello");

    nextScreen();
  };

  const handleSaveOptionValue = (optionValues: OptionValuesRequest[]) => {
    nextScreen();
  };

  const handleSaveProductVariant = async (variants: Variant[]) => {
    setVariants(variants);
    await handleUpdateProduct();
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
              type={BaseProductFormType.UPDATE}
              value={baseProduct ?? undefined}
              imageFiles={baseProductImages}
              onSubmit={handleSaveBaseProduct}
              onCancel={handleCancel}
            />
          </div>
        )}
        {screenIndex === ModalScreen.OPTION_VALUES_SCREEN && (
          <div className={cx("form-wrapper")}>
            <OptionValueForm
              disable={true}
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
              type={ProductVariantFormType.UPDATE}
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

export default UpdateProductModal;
