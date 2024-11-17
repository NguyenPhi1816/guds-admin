export type GetProductStatisticsRequest = {
  productId: number;
  fromDate: string;
  toDate: string;
  type: "VIEW" | "CART" | "PURCHASE" | "FAVORITE";
};

export type GetPurchasesStatisticsRequest = {
  fromDate: string;
  toDate: string;
};

export type GetProductStatisticsResponse = {
  date: string;
  count: string;
};

export type PriceChangeStatisticsRequest = {
  baseProductId: number;
  fromDate: string;
  toDate: string;
};

export type PriceChangeStatisticsResponse = {
  optionValue: string;
  prices: { createdAt: string; price: number }[];
};
