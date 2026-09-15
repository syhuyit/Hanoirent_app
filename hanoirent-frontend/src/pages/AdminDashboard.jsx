import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Lấy thông tin user từ localStorage (Lazy initialization)
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Tải danh sách bài đăng PENDING
  const fetchPendingPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts/pending");
      setPendingPosts(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách bài chờ duyệt:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra quyền Admin & gọi API khi component mount
  useEffect(() => {
    let isMounted = true;

    if (!user) {
      alert("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang Quản trị Admin!");
      navigate("/");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await API.get("/posts/pending");
        if (isMounted) {
          setPendingPosts(res.data);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách bài chờ duyệt:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  // Hàm duyệt hoặc từ chối bài đăng
  const handleUpdateStatus = async (postId, status) => {
    try {
      await API.put(`/posts/${postId}/status?status=${status}`);
      setMessage(
        status === "APPROVED"
          ? "Đã duyệt bài đăng thành công!"
          : "Đã từ chối bài đăng!",
      );
      // Tải lại danh sách sau khi cập nhật
      fetchPendingPosts();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(
        err.response?.data || "Có lỗi xảy ra khi cập nhật trạng thái bài viết!",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Trang Quản Trị Admin
            </h1>
            <p className="text-sm text-gray-500">
              Quản lý và duyệt bài đăng phòng trọ
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Về Trang chủ
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg font-medium">
            {message}
          </div>
        )}

        {/* Danh sách bài viết chờ duyệt */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Bài đăng chờ duyệt ({pendingPosts.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Hiện tại không có bài đăng nào cần duyệt.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                      Chờ duyệt (PENDING)
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {post.room?.title}
                    </h3>
                    <p className="text-orange-600 font-bold">
                      {post.room?.price?.toLocaleString("vi-VN")} VNĐ/tháng -{" "}
                      {post.room?.area} m²
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 <strong>Địa chỉ:</strong> {post.room?.address},{" "}
                      {post.room?.ward},{" "}
                      {post.room?.district?.replace("_", " ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      👤 <strong>Chủ trọ:</strong>{" "}
                      {post.room?.landlord?.fullName} (
                      {post.room?.landlord?.phone} -{" "}
                      {post.room?.landlord?.email})
                    </p>
                    <p className="text-sm text-gray-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong>Mô tả:</strong>{" "}
                      {post.room?.description || "Không có mô tả"}
                    </p>
                  </div>

                  {/* Nút bấm Thao tác */}
                  <div className="flex md:flex-col justify-end gap-2 min-w-[120px]">
                    <button
                      onClick={() => handleUpdateStatus(post.id, "APPROVED")}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Duyệt Bài
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(post.id, "REJECTED")}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
