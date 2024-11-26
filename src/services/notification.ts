"use server";
import { Notification, NotificationResult } from "@/types/notification";
import { getAccessToken } from "./auth";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";

export const getNotifications = async (
  page: number
): Promise<NotificationResult> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/notification?page=${page}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: NotificationResult | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const updateNotificationStatus = async (
  notiIds: number[]
): Promise<number> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/notification`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: JSON.stringify({ notiIds }),
      });
      const result: number | ErrorResponse = await res.json();

      if (typeof result !== "number") {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};
