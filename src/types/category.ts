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
  image: string;
  description: string;
  parentId: number | null;
};
