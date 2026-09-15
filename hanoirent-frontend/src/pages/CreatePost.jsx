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
  Sparkles
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
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Kiểm tra quyền truy cập của User (Chỉ Chủ trọ mới được đăng bài)
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "LANDLORD") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!user) return;

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        landlordId: user.id,
      };

      await API.post("/posts", payload);
      setSuccess("Đăng bài thành công! Bài viết đã được chuyển tới hàng chờ duyệt của Admin.");
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition"
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
              Điền thông tin chi tiết căn phòng để Quản trị viên duyệt và hiển thị trên bảng tin
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
                  Số nhà, ngõ, tên đường cụ thể <span className="text-red-400">*</span>
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

            {/* Mục 4: Mô tả tiện ích */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Mô tả chi tiết phòng & Tiện ích
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả về nội thất (giường, tủ, điều hòa, nóng lạnh), giờ giấc tự do, có chỗ sạc xe điện, nuôi thú cưng..."
                className="w-full p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
