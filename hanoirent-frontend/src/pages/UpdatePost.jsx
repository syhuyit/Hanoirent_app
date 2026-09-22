import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  DollarSign, 
  Maximize2, 
  FileText, 
  ArrowLeft, 
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
  Flame 
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

export default function UpdatePost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    ward: "",
    district: "CAU_GIAY",
    price: "",
    area: "",
    electricityPrice: "",
    waterPrice: "",
    internetPrice: "",
    serviceFee: "",
    parkingSlots: "1",
    hasElectricVehicleCharging: false,
    allowPets: false,
    freeHours: false,
    airConditioner: false,
    waterHeater: false,
    description: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/${id}`);
        const post = res.data;
        const room = post.room || {};

        setFormData({
          title: room.title || "",
          address: room.address || "",
          ward: room.ward || "",
          district: room.district || "CAU_GIAY",
          price: room.price || "",
          area: room.area || "",
          electricityPrice: room.electricityPrice || "",
          waterPrice: room.waterPrice || "",
          internetPrice: room.internetPrice || "",
          serviceFee: room.serviceFee || "",
          parkingSlots: room.parkingSlots ?? "1",
          hasElectricVehicleCharging: !!room.hasElectricVehicleCharging,
          allowPets: !!room.allowPets,
          freeHours: !!room.freeHours,
          airConditioner: !!room.airConditioner,
          waterHeater: !!room.waterHeater,
          description: room.description || "",
        });

        setExistingImages(room.images || []);
      } catch (err) {
        console.error("Lỗi khi tải thông tin bài đăng:", err);
        alert("Không thể tải thông tin bài đăng!");
        navigate("/my-posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload thêm ảnh mới nếu có
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        const fileData = new FormData();
        newFiles.forEach((file) => fileData.append("files", file));

        const uploadRes = await API.post("/upload/images", fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls = uploadRes.data || [];
      }

      const allImages = [...existingImages, ...uploadedUrls];

      // 2. Gửi request cập nhật
      await API.put(`/posts/${id}?landlordId=${user.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        electricityPrice: formData.electricityPrice ? parseFloat(formData.electricityPrice) : 0,
        waterPrice: formData.waterPrice ? parseFloat(formData.waterPrice) : 0,
        internetPrice: formData.internetPrice ? parseFloat(formData.internetPrice) : 0,
        serviceFee: formData.serviceFee ? parseFloat(formData.serviceFee) : 0,
        parkingSlots: parseInt(formData.parkingSlots) || 0,
        images: allImages,
        landlordId: user.id,
      });

      alert("Cập nhật bài đăng thành công! Bài viết đã chuyển sang trạng thái chờ Admin duyệt lại.");
      navigate("/my-posts");
    } catch (err) {
      console.error("Lỗi khi cập nhật bài đăng:", err);
      alert(err.response?.data || "Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-zinc-100">
        <Navbar />
        <div className="max-w-3xl mx-auto p-8 text-center text-zinc-400">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 pb-12">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/my-posts")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách phòng
        </button>

        <h1 className="text-2xl font-bold mb-2">Chỉnh sửa bài đăng #{id}</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Lưu ý: Sau khi cập nhật, bài đăng sẽ được chuyển về trạng thái Chờ duyệt (PENDING) để Admin kiểm duyệt lại.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-zinc-900/50 p-6 sm:p-8 rounded-2xl border border-zinc-800"
        >
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Tiêu đề bài đăng <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Giá và Diện tích */}
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
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  required
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
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vị trí: Quận / Phường / Địa chỉ */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
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
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
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
                  Phường / Xã
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Địa chỉ cụ thể (Số nhà, ngõ) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Chi phí dịch vụ: Điện, Nước, Internet, Dịch vụ */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Chi phí dịch vụ hàng tháng
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Giá điện (VNĐ/kWh)
                </label>
                <input
                  type="number"
                  name="electricityPrice"
                  value={formData.electricityPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Giá nước (VNĐ/khối hoặc người)
                </label>
                <input
                  type="number"
                  name="waterPrice"
                  value={formData.waterPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-indigo-400" /> Tiền Internet (VNĐ/tháng)
                </label>
                <input
                  type="number"
                  name="internetPrice"
                  value={formData.internetPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-purple-400" /> Phí dịch vụ chung (VNĐ/tháng)
                </label>
                <input
                  type="number"
                  name="serviceFee"
                  value={formData.serviceFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tiện ích & Quy định Checkbox */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-purple-400" />
              Tiện ích & Quy định
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
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
                  <input
                    type="checkbox"
                    name="hasElectricVehicleCharging"
                    checked={formData.hasElectricVehicleCharging}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600"
                  />
                  <Zap className="w-4 h-4 text-amber-400" /> Có sạc xe điện
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
                  <input
                    type="checkbox"
                    name="allowPets"
                    checked={formData.allowPets}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600"
                  />
                  <Dog className="w-4 h-4 text-pink-400" /> Cho phép nuôi thú cưng
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
                  <input
                    type="checkbox"
                    name="freeHours"
                    checked={formData.freeHours}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600"
                  />
                  <Clock className="w-4 h-4 text-emerald-400" /> Giờ giấc tự do
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
                  <input
                    type="checkbox"
                    name="airConditioner"
                    checked={formData.airConditioner}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600"
                  />
                  <Wind className="w-4 h-4 text-sky-400" /> Có điều hòa
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
                  <input
                    type="checkbox"
                    name="waterHeater"
                    checked={formData.waterHeater}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-600"
                  />
                  <Flame className="w-4 h-4 text-amber-500" /> Có bình nóng lạnh
                </label>
              </div>
            </div>
          </div>

          {/* Quản lý Hình ảnh */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4 text-amber-400" />
              Hình ảnh căn phòng
            </div>

            {/* Ảnh hiện tại */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-xs text-zinc-400 mb-2">Ảnh hiện có ({existingImages.length}):</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950">
                      <img src={url} alt={`Room ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thêm ảnh mới */}
            <div>
              <label className="block w-full border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80 transition">
                <ImagePlus className="w-6 h-6 text-zinc-500 mx-auto mb-1" />
                <span className="text-xs font-semibold text-zinc-300 block">Chọn thêm ảnh tải lên</span>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {newPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-3">
                  {newPreviews.map((src, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-blue-500/50 aspect-video bg-zinc-950">
                      <img src={src} alt={`New upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-zinc-950/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Nút lưu */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/my-posts")}
              className="w-1/3 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Đang lưu và tải ảnh..." : "Lưu thay đổi bài đăng"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
