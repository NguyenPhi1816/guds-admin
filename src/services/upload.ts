import { UploadResponse } from "@/types/upload";
import { ErrorResponse } from "@/types/error";

export const uploadImages = async (files: File[]): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file as any));
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_GUDS_API}/images/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data: UploadResponse | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
