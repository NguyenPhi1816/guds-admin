export type BlogCategory = {
  id: number;
  name: string;
  description: string;
  createAt: string;
  image: string;
  imageId: string;
};

export type Blog = {
  id: number;
  title: string;
  status: "ACTIVE" | "INACTIVE";
  createAt: string;
  updateAt: string;
  userId: number;
};

export type BlogDetail = {
  id: number;
  title: string;
  content: string;
  image: string;
  imageId: string;
  summary: string;
  createAt: string;
  updateAt: string;
  status: "ACTIVE" | "INACTIVE";
  userId: number;
};

export type CreateBlogCategory = {
  name: string;
  description: string;
  image: File;
};

export type UpdateBlogCategory = {
  id: number;
  name: string;
  description: string;
  existImage: string;
  existImageId: string;
  newImage: File | null;
};

export type CreateBlog = {
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  image: File;
};

export type UpdateBlog = {
  id: number;
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  existImage: string;
  existImageId: string;
  newImage: File | null;
};

export type UpdateBlogStatus = {
  id: number;
  status: "ACTIVE" | "INACTIVE";
};
