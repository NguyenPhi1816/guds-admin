import { UploadResponse } from "@/types/upload";
import { api } from "./api";

export const uploadImages = async (files: File[]): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", files[0] as any);
    const res = await fetch(`http://localhost:8080/api/images/upload`, {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as UploadResponse;
    return data;
  } catch (error) {
    throw error;
  }
};
