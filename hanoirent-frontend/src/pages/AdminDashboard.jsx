import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail 
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [actionLoading, setActionLoading] = useState(null);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Tải lại danh sách sau khi thao tác Duyệt/Từ chối
  const reloadPendingPosts = async () => {
    try {
      const res = await API.get("/posts/pending");
      setPendingPosts(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách bài chờ duyệt:", err);
    }
  };

  // Kiểm tra quyền Admin & tải dữ liệu ban đầu
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    let isMounted = true;

    const loadInitialData = async () => {
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

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const handleUpdateStatus = async (postId, status) => {
    setActionLoading(postId);
    try {
      await API.put(`/posts/${postId}/status?status=${status}`);
      setMessage({
        text:
          status === "APPROVED"
            ? "Đã duyệt bài đăng thành công! Bài viết đã được đưa lên trang chủ."
            : "Đã từ chối bài đăng!",
        type: status === "APPROVED" ? "success" : "warning",
      });
      await reloadPendingPosts();
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    } catch (err) {
      alert(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Có lỗi xảy ra khi cập nhật trạng thái bài viết!",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Operations Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Moderation Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Kiểm duyệt tin đăng phòng trọ
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Kiểm tra tính xác thực về giá, hình ảnh và thông tin của Chủ trọ để thanh lọc nội dung lừa đảo
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[11px] text-zinc-400 uppercase font-semibold">Chờ duyệt</p>
                <p className="text-lg font-bold text-white leading-none mt-0.5">
                  {pendingPosts.length} bài
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Message Banner */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-amber-950/40 border-amber-500/30 text-amber-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Hàng chờ trống!
            </h3>
            <p className="text-sm text-zinc-400">
              Hiện tại không còn bài đăng nào cần kiểm duyệt. Tất cả bài viết hợp lệ đã được phát hành lên hệ thống.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/90 p-6 hover:border-zinc-700 transition-all flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Post details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      Chờ duyệt (PENDING)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      <MapPin className="w-3 h-3" />
                      {post.room?.district?.replace("_", " ")}
                    </span>
                    <span className="text-xs text-zinc-500 ml-auto">
                      Mã bài: #{post.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {post.room?.title}
                  </h3>

                  <div className="flex flex-wrap items-baseline gap-3 text-sm">
                    <span className="text-xl font-black text-amber-400">
                      {post.room?.price?.toLocaleString("vi-VN")} VNĐ/tháng
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300 font-medium">
                      Diện tích: {post.room?.area} m²
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Địa chỉ cụ thể:</strong> {post.room?.address}, Phường {post.room?.ward}, Quận {post.room?.district?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Landlord information box */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs flex flex-wrap items-center gap-4 text-zinc-300">
                    <span className="font-semibold text-zinc-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      Chủ trọ:
                    </span>
                    <strong className="text-white">
                      {post.room?.landlord?.fullName}
                    </strong>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      {post.room?.landlord?.phone || "Chưa có SĐT"}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      {post.room?.landlord?.email}
                    </span>
                  </div>

                  {/* Description preview */}
                  {post.room?.description && (
                    <div className="p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/60 text-xs text-zinc-400 leading-relaxed italic">
                      "{post.room.description}"
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="flex lg:flex-col justify-end gap-3 min-w-[140px] pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                  <button
                    onClick={() => handleUpdateStatus(post.id, "APPROVED")}
                    disabled={actionLoading === post.id}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Duyệt Bài
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(post.id, "REJECTED")}
                    disabled={actionLoading === post.id}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Từ Chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
