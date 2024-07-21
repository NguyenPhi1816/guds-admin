export const formatCurrency = (currency: number) => {
  let VNDong = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return VNDong.format(currency);
};
