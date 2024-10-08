export type CategoryParentResponse = {
  id: number;
  slug: string;
  name: string;
};

export type CategoryResponse = {
  id: number;
  slug: string;
  name: string;
  image: string;
  description: string;
  parent: CategoryParentResponse;
  numberOfBaseProduct: number;
  numberOfChildren: number;
};

export type AddCategoryRequest = {
  name: string;
  image: File;
  description: string;
  parentId: number | null;
};

export type EditCategoryRequest = {
  id: number;
  name: string;
  existImage: string;
  newImage: File | null;
  description: string;
  parentId: number | null;
};
