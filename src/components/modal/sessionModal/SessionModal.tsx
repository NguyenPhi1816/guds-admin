"use client";
import styles from "./SessionModal.module.scss";
import classNames from "classnames/bind";

import { Button } from "antd";
import Modal from "antd/es/modal/Modal";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const cx = classNames.bind(styles);

const SessionModal = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session) {
      const refresh_token = session.user.refresh_token;
      const payload = JSON.parse(
        Buffer.from(refresh_token.split(".")[1], "base64").toString()
      );
      const exp = payload.exp * 1000 - Date.now();

      const timerId = setTimeout(() => {
        showModal();
      }, exp);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [session]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <Modal
        title="Thông báo"
        footer={[
          <Button
            onClick={handleLogout}
            className={cx("btn")}
            type="primary"
            key={1}
          >
            Đăng nhập
          </Button>,
        ]}
        open={isModalOpen}
      >
        <p>Phiên làm việc hết hạn. Vui lòng đăng nhập lại</p>
      </Modal>
    </>
  );
};

export default SessionModal;
