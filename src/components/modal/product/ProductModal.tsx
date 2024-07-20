import styles from "./ProductModal.module.scss";
import classNames from "classnames/bind";

import { Button, Flex, message, Modal, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { uploadImages } from "@/services/upload";
import {
  BaseProductDetail,
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  OptionValuesRequest,
  OptionValuesResponse,
  ProductVariantResponse,
  UpdateBaseProductRequest,
  UpdateProductVariantRequest,
  ValuesResponse,
} from "@/types/product";
import {
  createBaseProduct,
  createOptionValues,
  createProductVariant,
  getBaseProductBySlug,
  updateBaseProduct,
  updateProductVariant,
} from "@/services/product";
import BaseProductForm from "./BaseProductForm";
import OptionValueForm from "./OptionValueForm";
import ProductVariantForm, { Variant } from "./ProductVariantForm";

export enum ProductModalType {
  CREATE,
  UPDATE,
}

interface IProductModal {
  type: ProductModalType;
  open: boolean;
  slug?: string | null;
  onCancel: () => void;
  onRefresh: (message: string) => void;
}

const cx = classNames.bind(styles);

const ProductModal: React.FC<IProductModal> = ({
  type,
  open,
  slug,
  onCancel,
  onRefresh,
}) => {
  const INITIAL_BASE_PRODUCT: CreateBaseProductRequest = {
    name: "",
    description: "",
    brandId: -1,
    categoryIds: [],
    images: [],
  };

  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataFromSlug, setDataFromSlug] = useState<BaseProductDetail | null>(
    null
  );
  const [baseProduct, setBaseProduct] =
    useState<CreateBaseProductRequest>(INITIAL_BASE_PRODUCT);
  const [baseProductImages, setBaseProductImages] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);
  const [option, setOption] = useState<OptionValuesRequest[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [refreshForm, setRefreshForm] = useState<boolean>(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    switch (type) {
      case ProductModalType.CREATE: {
        setTitle("Thêm sản phẩm");
        break;
      }
      case ProductModalType.UPDATE: {
        setTitle("Chỉnh sửa sản phẩm");
        break;
      }
    }
  }, [type]);

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
          messageApi.error(error.message);
        }
      }
    };
    if (slug && refreshForm) {
      fetcher(slug);
      setRefreshForm(false);
    }
  }, [slug, refreshForm]);

  const handleBaseProductFormChange = (
    baseProduct: CreateBaseProductRequest,
    images: (File | null)[]
  ) => {
    setBaseProduct(baseProduct);
    setBaseProductImages(images);
  };

  const handleOptionValueFormChange = (optionValues: OptionValuesRequest[]) => {
    setOption(optionValues);
  };

  const handleProductVariantFormChange = (variants: Variant[]) => {
    setVariants(variants);
  };

  const handleCancel = () => {
    setBaseProduct(INITIAL_BASE_PRODUCT);
    setOption([]);
    setVariants([]);
    setRefreshForm(true);
    onCancel();
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

  useEffect(() => {
    const allCombinations = generateCombinations(option);
    switch (type) {
      case ProductModalType.CREATE: {
        const initialVariants: Variant[] = allCombinations.map(
          (combination) => ({
            id: null,
            image: null,
            imageUrl: "",
            price: 1000,
            quantity: 1,
            optionValues: combination,
          })
        );
        setVariants(initialVariants);
        break;
      }
      case ProductModalType.UPDATE: {
        // const existedCombinations = variants.map(
        //   (variant) => variant.optionValues
        // );
        // if (
        //   JSON.stringify(allCombinations) !==
        //   JSON.stringify(existedCombinations)
        // ) {
        //   const newVariants: Variant[] = allCombinations.map((combination) => {
        //     return {
        //       image: null,
        //       price: 1000,
        //       quantity: 1,
        //       optionValues: combination,
        //     };
        //   });

        //   setVariants(newVariants);
        // }
        break;
      }
    }
  }, [option]);

  const handleCreateProduct = async () => {
    let isValid = true;
    isValid = !baseProductImages.includes(null);
    if (!isValid) {
      throw new Error("Vui lòng chọn 3 ảnh cho sản phẩm");
    }
    isValid =
      !!baseProduct.name &&
      !!baseProduct.description &&
      !!baseProduct.brandId &&
      baseProduct.categoryIds.length > 0;
    if (!isValid) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }
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
    handleCancel();
    onRefresh("Thêm sản phẩm thành công");
  };

  const handleUpdateProduct = async () => {
    let isValid = true;
    isValid = !dataFromSlug;
    if (isValid) throw new Error("Có lỗi xảy ra");
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
    setRefreshForm(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      switch (type) {
        case ProductModalType.CREATE: {
          await handleCreateProduct();
          break;
        }
        case ProductModalType.UPDATE: {
          await handleUpdateProduct();
          break;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
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
      onCancel={() => handleCancel()}
      footer={[
        <Button onClick={() => handleCancel()} key={1}>
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
      width={"98%"}
      className={cx("modal")}
    >
      <Flex>
        <div className={cx("form-wrapper")}>
          <BaseProductForm
            defaultValue={baseProduct}
            onChange={handleBaseProductFormChange}
          />
        </div>
        <div className={cx("form-wrapper")}>
          <OptionValueForm
            disable={type === ProductModalType.UPDATE}
            defaultValue={option}
            onChange={handleOptionValueFormChange}
          />
        </div>
        <div className={cx("form-wrapper")}>
          <ProductVariantForm
            defaultValue={variants}
            onChange={handleProductVariantFormChange}
          />
        </div>
      </Flex>
      {contextHolder}
    </Modal>
  );
};

export default ProductModal;
