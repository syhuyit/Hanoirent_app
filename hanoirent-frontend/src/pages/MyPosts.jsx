import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  MapPin,
  Maximize2,
  Clock,
  CheckCircle2,
  XCircle,
  Home as HomeIcon,
  Sparkles,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Tải lại danh sách sau khi thao tác
  const reloadMyPosts = async () => {
    if (!user) return;
    try {
      const res = await API.get(`/posts/landlord/${user.id}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài của chủ trọ:", err);
    }
  };

  // Kiểm tra quyền truy cập & tải dữ liệu ban đầu
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "LANDLORD") {
      navigate("/");
      return;
    }

    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const res = await API.get(`/posts/landlord/${user.id}`);
        if (isMounted) {
          setPosts(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách bài của chủ trọ:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  // Toggle trạng thái phòng: Đã cho thuê / Mở lại còn trống
  const handleToggleAvailability = async (postId, currentAvailable) => {
    if (!user) return;
    setActionLoading(postId);
    const newStatus = !currentAvailable;

    try {
      await API.put(
        `/posts/${postId}/availability?landlordId=${user.id}&isAvailable=${newStatus}`,
      );
      setMessage({
        text: newStatus
          ? "Đã mở lại phòng! Tin đăng sẽ hiển thị trở lại trên trang chủ cho người thuê."
          : "Đã xác nhận trọ đã được thuê! Hệ thống đã tự động ẩn tin khỏi trang chủ của người thuê.",
        type: newStatus ? "success" : "info",
      });
      await reloadMyPosts();
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    } catch (err) {
      alert(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Có lỗi xảy ra khi cập nhật trạng thái phòng!",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Xóa bài đăng
  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác!",
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/posts/${postId}`);
      setMessage({
        text: "Xóa bài đăng thành công!",
        type: "success",
      });
      await reloadMyPosts();
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    } catch (err) {
      console.error("Lỗi khi xóa bài đăng:", err);
      alert("Xóa bài đăng thất bại!");
    }
  };

  // Thống kê nhanh
  const stats = {
    total: posts.length,
    available: posts.filter(
      (p) => p.room?.isAvailable && p.status === "APPROVED",
    ).length,
    rented: posts.filter((p) => !p.room?.isAvailable).length,
    pending: posts.filter((p) => p.status === "PENDING").length,
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Khu vực Chủ trọ (Landlord Dashboard)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Quản lý danh sách phòng trọ của bạn
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Theo dõi tình trạng phê duyệt và chủ động đánh dấu phòng đã cho
              thuê để tránh bị làm phiền
            </p>
          </div>

          <Link
            to="/create-post"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />+ Đăng phòng mới
          </Link>
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tổng tin đã đăng
            </p>
            <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/20">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Đang mở cho thuê
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {stats.available}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-700/60">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Trọ đã được thuê
            </p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {stats.rented}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Đang chờ Admin duyệt
            </p>
            <p className="text-2xl font-black text-amber-300 mt-1">
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-blue-950/40 border-blue-500/30 text-blue-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 mx-auto mb-4">
              <HomeIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Bạn chưa có bài đăng nào
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Hãy bắt đầu đăng tin căn phòng đầu tiên của bạn để tiếp cận hàng
              nghìn người thuê tại Hà Nội!
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng bài trọ ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const isAvailable = Boolean(post.room?.isAvailable);
              const isApproved = post.status === "APPROVED";
              const isPending = post.status === "PENDING";
              const isRejected = post.status === "REJECTED";

              return (
                <div
                  key={post.id}
                  className={`rounded-2xl bg-zinc-900/80 backdrop-blur-sm border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    !isAvailable
                      ? "border-zinc-800/60 opacity-80"
                      : "border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-blue-500/5"
                  }`}
                >
                  <div className="p-6">
                    {/* Status badges row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      {/* Post Moderation Status */}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã duyệt
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Chờ duyệt
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Bị từ chối
                        </span>
                      )}

                      {/* Availability status tag */}
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Đang mở thuê
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 border border-zinc-700 px-2.5 py-0.5 rounded-full">
                          Đã cho thuê (Đã ẩn)
                        </span>
                      )}
                    </div>

                    {/* Room title */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {post.room?.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-4">
                      <span className="text-2xl font-black text-amber-400 tracking-tight">
                        {post.room?.price?.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">
                        VNĐ/tháng
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs text-zinc-300 mb-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Maximize2 className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Diện tích:</span>
                        <strong className="text-zinc-200">
                          {post.room?.area} m²
                        </strong>
                      </div>

                      <div className="flex items-start gap-2 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {post.room?.address}, {post.room?.ward},{" "}
                          {post.room?.district?.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Notice when room is rented */}
                    {!isAvailable && (
                      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 mb-2">
                        💡 Phòng này đang được ẩn khỏi bảng tin của người thuê.
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="px-5 py-3.5 border-t border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-2">
                    {/* Nút Sửa & Nút Xóa */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/update-post/${post.id}`}
                        title="Chỉnh sửa bài đăng"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sửa</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(post.id)}
                        title="Xóa bài đăng"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-medium transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>

                    {/* Toggle button "Trọ đã được thuê" / "Mở lại phòng trống" */}
                    <button
                      onClick={() =>
                        handleToggleAvailability(post.id, isAvailable)
                      }
                      disabled={actionLoading === post.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                        isAvailable
                          ? "bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 shadow-sm"
                          : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {actionLoading === post.id ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Đã cho thuê</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mở lại phòng</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
