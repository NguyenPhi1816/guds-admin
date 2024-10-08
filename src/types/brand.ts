export type Brand = {
  id: number;
  slug: string;
  name: string;
  image: string;
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
  newImage: File | null;
};
