export type Order = {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: string;
};

export type OrderProduct = {
  id: number;
  productName: string;
  productImage: string;
  optionValue: string[];
  quantity: number;
  price: number;
};

export type Payment = {
  paymentMethod: string;
  paymentDate: string | null;
  totalPrice: number;
  status: string;
  transactionId: string | null;
};

export type OrderDetail = {
  id: number;
  userId: number;
  userName: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: string;
  orderDetails: OrderProduct[];
  payment: Payment;
};
