import { productStatus } from "@/constant/enum/productStatus";

export type BaseProduct = {
  id: number;
  slug: string;
  name: string;
  categories: string[];
  brand: string;
  status: string;
};

export type CreateBaseProductRequest = {
  name: string;
  description: string;
  categoryIds: number[];
  brandId: number;
  images: string[];
};

export type UpdateBaseProductRequest = {
  id: number;
  name: string;
  description: string;
  categoryIds: number[];
  brandId: number;
  images: string[];
};

export type UpdateBaseProductStatusRequest = {
  id: number;
  status: productStatus;
};

export type OptionValuesRequest = {
  option: string;
  values: string[];
};

export type CreateOptionValueRequest = {
  baseProductId: number;
  optionValues: OptionValuesRequest[];
};

export type ValuesResponse = {
  valueId: number;
  valueName: string;
};

export type OptionValuesResponse = {
  optionId: number;
  optionName: string;
  optionStatus: string;
  values: ValuesResponse[];
};

export type CreateProductVariantRequest = {
  baseProductId: number;
  image: string;
  quantity: number;
  price: number;
  optionValueIds: number[];
};

export type UpdateProductVariantRequest = {
  productVariantId: number;
  image: string;
  quantity: number;
  price: number;
};

export type OptionValueResponse = {
  option: string;
  value: string;
};

export type ProductVariantResponse = {
  id: number;
  image: string;
  quantity: number;
  optionValue: OptionValueResponse[];
  price: number;
};

export type BaseProductDetailCategory = {
  id: number;
  slug: string;
  name: string;
};

export type BaseProductDetailBrand = {
  id: number;
  slug: string;
  name: string;
  image: string;
};

export type BaseProductDetailImage = {
  id: number;
  path: string;
  isDefault: boolean;
};

export type BaseProductDetailOptionValue = {
  option: string;
  values: string[];
};

export type BaseProductDetailRelatedProduct = {
  id: number;
  image: string;
  name: string;
  price: number;
  slug: string;
  variantId: number;
  averageRating: number;
  numberOfReviews: number;
  numberOfPurchases: number;
};

export type ProductVariantOptionValue = {
  option: string;
  value: string;
};

export type BaseProductDetailVariant = {
  id: number;
  image: string;
  quantity: number;
  optionValue: ProductVariantOptionValue[];
  price: number;
};

export type BaseProductDetail = {
  id: number;
  slug: string;
  name: string;
  description: string;
  categories: BaseProductDetailCategory[];
  brand: BaseProductDetailBrand;
  status: string;
  averageRating: number;
  numberOfPurchases: number;
  numberOfReviews: number;
  images: BaseProductDetailImage[];
  optionValues: BaseProductDetailOptionValue[];
  relatedProducts: BaseProductDetailRelatedProduct[];
  productVariants: BaseProductDetailVariant[];
};
