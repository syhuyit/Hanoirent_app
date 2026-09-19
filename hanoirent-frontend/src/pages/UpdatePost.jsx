import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

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
    parkingSlots: "",
    hasElectricVehicleCharging: false,
    allowPets: false,
    freeHours: false,
    airConditioner: false,
    waterHeater: false,
    description: "",
  });

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
          parkingSlots: room.parkingSlots || "",
          hasElectricVehicleCharging: !!room.hasElectricVehicleCharging,
          allowPets: !!room.allowPets,
          freeHours: !!room.freeHours,
          airConditioner: !!room.airConditioner,
          waterHeater: !!room.waterHeater,
          description: room.description || "",
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    setSubmitting(true);
    try {
      await API.put(`/posts/${id}?landlordId=${user.id}`, {
        ...formData,
        landlordId: user.id,
      });

      // Thông báo cho chủ trọ biết bài viết đã chuyển sang chờ duyệt
      alert(
        "Cập nhật bài đăng thành công! Bài đăng của bạn đã được gửi tới Admin để duyệt lại.",
      );
      navigate("/my-posts"); // Chuyển hướng về trang danh sách bài đăng của tôi
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
        <h1 className="text-2xl font-bold mb-6">Chỉnh sửa bài đăng #{id}</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800"
        >
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tiêu đề bài đăng
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Giá và Diện tích */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Giá thuê (VNĐ/tháng)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Diện tích (m²)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Địa chỉ và Phường/Xã */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Địa chỉ cụ thể
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phường / Xã
              </label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Chi phí điện, nước, gửi xe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Giá điện (VNĐ/kWh)
              </label>
              <input
                type="number"
                name="electricityPrice"
                value={formData.electricityPrice}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Giá nước (VNĐ/khối hoặc người)
              </label>
              <input
                type="number"
                name="waterPrice"
                value={formData.waterPrice}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Chỗ để xe (xe/phòng)
              </label>
              <input
                type="number"
                name="parkingSlots"
                value={formData.parkingSlots}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Các tiện ích Checkbox */}
          <div className="pt-2">
            <label className="block text-sm font-medium mb-3 text-zinc-300">
              Tiện ích & Đặc điểm
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700">
                <input
                  type="checkbox"
                  name="hasElectricVehicleCharging"
                  checked={formData.hasElectricVehicleCharging}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm">Có sạc xe điện</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700">
                <input
                  type="checkbox"
                  name="allowPets"
                  checked={formData.allowPets}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm">Cho phép nuôi thú cưng</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700">
                <input
                  type="checkbox"
                  name="freeHours"
                  checked={formData.freeHours}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm">Giờ giấc tự do</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700">
                <input
                  type="checkbox"
                  name="airConditioner"
                  checked={formData.airConditioner}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm">Điều hòa</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700">
                <input
                  type="checkbox"
                  name="waterHeater"
                  checked={formData.waterHeater}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm">Máy nước nóng</span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Nút lưu */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl transition disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : "Cập nhật bài đăng"}
          </button>
        </form>
      </main>
    </div>
  );
}
