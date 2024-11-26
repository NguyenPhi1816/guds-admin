export type Notification = {
  id: number;
  userId: number;
  message: string;
  receiverEmail: string;
  type: "NEW ORDER" | "CANCEL ORDER" | "SUCCESS ORDER";
  createAt: string;
  isRead: boolean;
};

export type NotificationResult = {
  data: Notification[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    unreadNotifications: number;
    totalPages: number;
  };
};
