export const PROPERTY_TYPES = [
  { code: "ROOM", label: "Phòng trọ", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { code: "MINI_APARTMENT", label: "Chung cư mini", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { code: "SERVICE_APARTMENT", label: "Căn hộ dịch vụ", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { code: "HOUSE", label: "Nhà nguyên căn", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
];

export const PROPERTY_TYPE_NAMES = {
  ROOM: "Phòng trọ",
  MINI_APARTMENT: "Chung cư mini",
  SERVICE_APARTMENT: "Căn hộ dịch vụ",
  HOUSE: "Nhà nguyên căn",
};

export const DISTRICTS = [
  { code: "CAU_GIAY", name: "Cầu Giấy" },
  { code: "DONG_DA", name: "Đống Đa" },
  { code: "BA_DINH", name: "Ba Đình" },
  { code: "HOAN_KIEM", name: "Hoàn Kiếm" },
  { code: "TAY_HO", name: "Tây Hồ" },
  { code: "THANH_XUAN", name: "Thanh Xuân" },
  { code: "HAI_BA_TRUNG", name: "Hai Bà Trưng" },
  { code: "HOANG_MAI", name: "Hoàng Mai" },
  { code: "LONG_BIEN", name: "Long Biên" },
  { code: "NAM_TU_LIEM", name: "Nam Từ Liêm" },
  { code: "BAC_TU_LIEM", name: "Bắc Từ Liêm" },
  { code: "HA_DONG", name: "Hà Đông" },
];

export const DISTRICT_NAMES = {
  CAU_GIAY: "Cầu Giấy",
  DONG_DA: "Đống Đa",
  BA_DINH: "Ba Đình",
  HOAN_KIEM: "Hoàn Kiếm",
  TAY_HO: "Tây Hồ",
  THANH_XUAN: "Thanh Xuân",
  HAI_BA_TRUNG: "Hai Bà Trưng",
  HOANG_MAI: "Hoàng Mai",
  LONG_BIEN: "Long Biên",
  NAM_TU_LIEM: "Nam Từ Liêm",
  BAC_TU_LIEM: "Bắc Từ Liêm",
  HA_DONG: "Hà Đông",
};

export const PRICE_RANGES = [
  { label: "Tất cả giá", min: "", max: "" },
  { label: "Dưới 3 triệu", min: "", max: 3000000 },
  { label: "3 - 5 triệu", min: 3000000, max: 5000000 },
  { label: "5 - 8 triệu", min: 5000000, max: 8000000 },
  { label: "8 - 15 triệu", min: 8000000, max: 15000000 },
  { label: "Trên 15 triệu", min: 15000000, max: "" },
];

export const formatVND = (amount) => {
  if (amount == null || isNaN(amount)) return "0 đ";
  return Number(amount).toLocaleString("vi-VN") + " đ";
};
