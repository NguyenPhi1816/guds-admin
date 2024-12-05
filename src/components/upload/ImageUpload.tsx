import React, { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { GetProp, UploadProps } from "antd";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

interface IImageUpload {
  defaultValue?: string | null;
  onChange: (file: File, imageUrl?: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<IImageUpload> = ({
  defaultValue,
  onChange,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (defaultValue) {
      setImageUrl(defaultValue);
    }
  }, [defaultValue]);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const handleChange: UploadProps["onChange"] = (info) => {
    getBase64(info.file.originFileObj as FileType, (url) => {
      setImageUrl(url);
    });
  };

  const uploadAction = (file: File) => {
    getBase64(file as FileType, (url) => {
      onChange(file, url);
    });
    return "http://localhost:8080/api/images/upload";
  };

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      action={uploadAction}
      disabled={disabled}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
      ) : (
        uploadButton
      )}
    </Upload>
  );
};

export default ImageUpload;
