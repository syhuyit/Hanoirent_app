import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function CreatePost() {
  const navigate = useNavigate();

  // Khởi tạo state user trực tiếp từ localStorage (Lazy initialization)
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
    district: "CAU_GIAY", // Mặc định chọn Quận Cầu Giấy
    ward: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Kiểm tra quyền truy cập của User khi vào trang
  useEffect(() => {
    if (!user) {
      alert("Vui lòng đăng nhập trước khi đăng bài!");
      navigate("/login");
    } else if (user.role !== "LANDLORD" && user.role !== "ADMIN") {
      alert("Chỉ tài khoản Chủ trọ mới có quyền đăng bài!");
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) return;

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        landlordId: user.id, // Lấy ID của chủ trọ đang đăng nhập
      };

      await API.post("/posts", payload);
      setSuccess("Đăng bài thành công! Bài viết đang chờ Admin duyệt.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err.response?.data ||
          "Đăng bài thất bại. Vui lòng kiểm tra lại thông tin!",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Đăng Bài Cho Thuê Phòng Trọ
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tiêu đề bài đăng
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Cho thuê phòng khép kín giá rẻ Cầu Giấy"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Giá thuê (VNĐ/tháng)
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="VD: 3500000"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diện tích (m²)
              </label>
              <input
                type="number"
                name="area"
                required
                value={formData.area}
                onChange={handleChange}
                placeholder="VD: 25"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quận / Huyện
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="CAU_GIAY">Cầu Giấy</option>
                <option value="DONG_DA">Đống Đa</option>
                <option value="BA_DINH">Ba Đình</option>
                <option value="HOAN_KIEM">Hoàn Kiếm</option>
                <option value="TAY_HO">Tây Hồ</option>
                <option value="THANH_XUAN">Thanh Xuân</option>
                <option value="HAI_BA_TRUNG">Hai Bà Trưng</option>
                <option value="HOANG_MAI">Hoàng Mai</option>
                <option value="LONG_BIEN">Long Biên</option>
                <option value="NAM_TU_LIEM">Nam Từ Liêm</option>
                <option value="BAC_TU_LIEM">Bắc Từ Liêm</option>
                <option value="HA_DONG">Hà Đông</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phường / Xã
              </label>
              <input
                type="text"
                name="ward"
                required
                value={formData.ward}
                onChange={handleChange}
                placeholder="VD: Dịch Vọng"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="VD: Số 15 ngõ 68 Xuân Thủy"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả chi tiết phòng
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả về tiện ích: Điều hòa, nóng lạnh, giờ giấc tự do, có chỗ để xe..."
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-1/2 rounded-lg bg-gray-200 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-1/2 rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
            >
              Đăng Bài
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
