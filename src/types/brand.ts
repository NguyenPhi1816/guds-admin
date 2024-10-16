export type Brand = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageId: string;
  numberOfProducts: number;
};

export type CreateBrandRequest = {
  name: string;
  image: File;
};

export type UpdateBrandRequest = {
  id: number;
  name: string;
  existImage: string;
  existImageId: string;
  newImage: File | null;
};
