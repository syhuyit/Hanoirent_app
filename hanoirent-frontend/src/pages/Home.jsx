import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);

  // Khởi tạo user trực tiếp từ localStorage
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Tải danh sách bài đăng khi selectedDistrict thay đổi
  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = selectedDistrict
          ? `/posts?district=${selectedDistrict}`
          : "/posts";
        const res = await API.get(url);
        if (isMounted) {
          setPosts(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách bài đăng:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Hanoi<span className="text-orange-500">Rent</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  Xin chào,{" "}
                  <strong className="text-blue-600">{user.fullName}</strong> (
                  {user.role})
                </span>

                {(user.role === "LANDLORD" || user.role === "ADMIN") && (
                  <Link
                    to="/create-post"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    + Đăng bài trọ
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm transition"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 font-medium hover:underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Thanh lọc theo Quận */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Khám phá phòng trọ tại Hà Nội
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Lọc theo Quận:
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 bg-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Tất cả các quận --</option>
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
        </div>

        {/* Danh sách phòng trọ */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Đang tải danh sách phòng trọ...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">
              Chưa có bài đăng nào được duyệt ở khu vực này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="p-5">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold mb-2">
                    {post.room?.district?.replace("_", " ")}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-2">
                    {post.room?.title}
                  </h3>
                  <p className="text-orange-600 font-bold text-xl mb-3">
                    {post.room?.price?.toLocaleString("vi-VN")} VNĐ/tháng
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>📐 Diện tích: {post.room?.area} m²</p>
                    <p className="line-clamp-1">
                      📍 Địa chỉ: {post.room?.address}, {post.room?.ward}
                    </p>
                    <p>
                      👤 Chủ trọ: {post.room?.landlord?.fullName} (
                      {post.room?.landlord?.phone})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
