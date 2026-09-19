import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  DollarSign,
  Maximize2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Zap,
  Droplets,
  Wifi,
  Receipt,
  Car,
  Dog,
  Clock,
  ImagePlus,
  X,
  Wind,
  Flame,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const DISTRICTS = [
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

export default function CreatePost() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    address: "",
    district: "CAU_GIAY",
    ward: "",
    // Chi phí dịch vụ mở rộng
    electricityPrice: "",
    waterPrice: "",
    internetPrice: "",
    serviceFee: "",
    // Tiện ích & Quy định
    parkingSlots: "1",
    hasElectricVehicleCharging: false,
    allowPets: false,
    freeHours: false,
    airConditioner: false,
    waterHeater: false,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Kiểm tra quyền truy cập của User (Chỉ Chủ trọ mới được đăng bài)
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "LANDLORD" && user.role !== "ADMIN") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (error) setError("");
  };

  // Xử lý chọn nhiều ảnh và hiển thị preview
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Xóa ảnh đã chọn khỏi danh sách preview
  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!user) return;

    try {
      // 1. Upload danh sách ảnh qua API Cloudinary Backend
      let uploadedImages = [];
      if (selectedFiles.length > 0) {
        const fileData = new FormData();
        selectedFiles.forEach((file) => fileData.append("files", file));

        const uploadRes = await API.post("/upload/images", fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedImages = uploadRes.data;
      }

      // 2. Tạo bài đăng với đầy đủ dữ liệu Yêu cầu 1
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        electricityPrice: formData.electricityPrice
          ? parseFloat(formData.electricityPrice)
          : 0,
        waterPrice: formData.waterPrice ? parseFloat(formData.waterPrice) : 0,
        internetPrice: formData.internetPrice
          ? parseFloat(formData.internetPrice)
          : 0,
        serviceFee: formData.serviceFee ? parseFloat(formData.serviceFee) : 0,
        parkingSlots: parseInt(formData.parkingSlots) || 0,
        images: uploadedImages,
        landlordId: user.id,
      };

      await API.post("/posts", payload);
      setSuccess(
        "Đăng bài thành công! Bài viết đã được chuyển tới hàng chờ duyệt của Admin.",
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Đăng bài thất bại. Vui lòng kiểm tra lại thông tin!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Dành cho Chủ trọ & Đối tác
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Đăng tin cho thuê phòng trọ
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              Điền đầy đủ chi phí, tiện ích và tải ảnh phòng lên Cloudinary để
              đăng bài
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/30 p-4 flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4 flex items-start gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mục 1: Tiêu đề */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Tiêu đề bài đăng <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="VD: Cho thuê phòng khép kín full đồ tại Cầu Giấy"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Mục 2: Giá & Diện tích */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Giá thuê (VNĐ/tháng) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="price"
                    required
                    min="100000"
                    step="50000"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="VD: 3500000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Diện tích (m²) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Maximize2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="area"
                    required
                    min="5"
                    step="0.5"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="VD: 25"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Mục 3: Vị trí */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                Vị trí & Địa chỉ chi tiết
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Quận / Huyện
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d.code} value={d.code}>
                        Quận {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Phường / Xã <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="ward"
                    required
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="VD: Dịch Vọng Hậu"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Số nhà, ngõ, tên đường cụ thể{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="VD: Số 15 ngõ 68 Xuân Thủy"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Mục 4: Chi phí dịch vụ mở rộng */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Chi tiết Chi phí dịch vụ
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Giá điện
                    (VNĐ/kWh)
                  </label>
                  <input
                    type="number"
                    name="electricityPrice"
                    value={formData.electricityPrice}
                    onChange={handleChange}
                    placeholder="VD: 3500"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" /> Giá nước
                    (VNĐ/m³ hoặc người)
                  </label>
                  <input
                    type="number"
                    name="waterPrice"
                    value={formData.waterPrice}
                    onChange={handleChange}
                    placeholder="VD: 100000"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-indigo-400" /> Tiền
                    Internet (VNĐ/tháng)
                  </label>
                  <input
                    type="number"
                    name="internetPrice"
                    value={formData.internetPrice}
                    onChange={handleChange}
                    placeholder="VD: 100000"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-purple-400" /> Phí dịch
                    vụ chung (VNĐ/tháng)
                  </label>
                  <input
                    type="number"
                    name="serviceFee"
                    value={formData.serviceFee}
                    onChange={handleChange}
                    placeholder="VD: 50000"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Mục 5: Tiện ích & Quy định */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-purple-400" />
                Tiện ích & Quy định căn phòng
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Số chỗ để xe máy
                  </label>
                  <input
                    type="number"
                    name="parkingSlots"
                    min="0"
                    value={formData.parkingSlots}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-2.5 pt-2 sm:pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      name="hasElectricVehicleCharging"
                      checked={formData.hasElectricVehicleCharging}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 cursor-pointer"
                    />
                    <Zap className="w-4 h-4 text-amber-400" /> Có sạc xe điện
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      name="allowPets"
                      checked={formData.allowPets}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 cursor-pointer"
                    />
                    <Dog className="w-4 h-4 text-orange-400" /> Cho phép nuôi
                    thú cưng
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      name="freeHours"
                      checked={formData.freeHours}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 cursor-pointer"
                    />
                    <Clock className="w-4 h-4 text-emerald-400" /> Giờ giấc tự
                    do (không chung chủ)
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      name="airConditioner"
                      checked={formData.airConditioner}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 cursor-pointer"
                    />
                    <Wind className="w-4 h-4 text-sky-400" /> Có điều hòa
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      name="waterHeater"
                      checked={formData.waterHeater}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 cursor-pointer"
                    />
                    <Flame className="w-4 h-4 text-amber-500" /> Có bình nóng
                    lạnh
                  </label>
                </div>
              </div>
            </div>

            {/* Mục 6: Upload Hình ảnh Cloudinary */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-amber-400" />
                Hình ảnh thực tế phòng trọ
              </div>

              <div>
                <label className="block w-full border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80 transition">
                  <ImagePlus className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-zinc-300 block">
                    Nhấn để chọn ảnh từ máy
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 block">
                    Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB/ảnh)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Màn hình Preview danh sách ảnh */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {previews.map((src, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950"
                    >
                      <img
                        src={src}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mục 7: Mô tả chi tiết */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Mô tả chi tiết phòng & Nội thất
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả về nội thất (giường, tủ, điều hòa, nóng lạnh), tình trạng cọc phòng..."
                className="w-full p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tải ảnh & lưu...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    Gửi bài đăng duyệt
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
