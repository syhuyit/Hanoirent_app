import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Maximize2,
  PhoneCall,
  Building2,
  Filter,
  Search,
  Sparkles,
  CheckCircle2,
  Eye,
  Camera,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const DISTRICT_NAMES = {
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

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Tải danh sách bài đăng đã duyệt từ Backend
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

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Universal Dark Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16 border-b border-zinc-800/60 bg-gradient-to-b from-[#0e1017] to-[#090a0f]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Nền tảng thuê trọ tương tác thế hệ mới
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Khám phá không gian sống lý tưởng tại{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Hà Nội
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            100% phòng trọ được xác thực thủ công bởi Quản trị viên. Thông tin
            giá cả, điện nước, địa chỉ minh bạch, liên hệ trực tiếp chủ nhà
            không qua trung gian.
          </p>

          {/* District Filter Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="p-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-400 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                  Khu vực:
                </span>
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full sm:flex-1 bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="">Tất cả các Quận / Huyện</option>
                {Object.entries(DISTRICT_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>
                    Quận {name}
                  </option>
                ))}
              </select>

              {selectedDistrict && (
                <button
                  onClick={() => setSelectedDistrict("")}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              {selectedDistrict
                ? `Phòng trọ tại Quận ${DISTRICT_NAMES[selectedDistrict]}`
                : "Tất cả phòng trọ đã duyệt"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Hiển thị {posts.length} bài đăng đang có sẵn
            </p>
          </div>
        </div>

        {/* Feed Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse flex flex-col justify-between overflow-hidden"
              >
                <div className="w-full h-48 bg-zinc-800" />
                <div className="p-5 space-y-3">
                  <div className="w-24 h-4 bg-zinc-800 rounded-full" />
                  <div className="w-3/4 h-5 bg-zinc-800 rounded-lg" />
                  <div className="w-1/2 h-6 bg-zinc-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Chưa có phòng trọ phù hợp
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Hiện chưa có bài đăng nào được duyệt ở khu vực này. Bạn có thể
              chọn Quận khác hoặc quay lại sau!
            </p>
            {selectedDistrict && (
              <button
                onClick={() => setSelectedDistrict("")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Xem tất cả phòng trọ
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const districtName =
                DISTRICT_NAMES[post.room?.district] ||
                post.room?.district?.replace("_", " ");

              const defaultImage =
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop";
              const coverImage =
                post.room?.images && post.room.images.length > 0
                  ? post.room.images[0]
                  : defaultImage;

              return (
                <div
                  key={post.id}
                  className="group rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 hover:border-zinc-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Image Banner */}
                    <Link
                      to={`/posts/${post.id}`}
                      className="block relative aspect-video overflow-hidden bg-zinc-950"
                    >
                      <img
                        src={coverImage}
                        alt={post.room?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-blue-400 border border-blue-500/30">
                          <MapPin className="w-3 h-3" />
                          Quận {districtName}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-zinc-950/80 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã duyệt
                        </span>
                      </div>
                      {post.room?.images && post.room.images.length > 1 && (
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-zinc-700/60">
                            <Camera className="w-3 h-3" />
                            {post.room.images.length} ảnh
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content Section */}
                    <div className="p-5">
                      <Link to={`/posts/${post.id}`}>
                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                          {post.room?.title}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-xl font-black text-amber-400 tracking-tight">
                          {post.room?.price?.toLocaleString("vi-VN")}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          VNĐ/tháng
                        </span>
                      </div>

                      {/* Details Box */}
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300 mb-3">
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
                            {post.room?.address}, {post.room?.ward}
                          </span>
                        </div>
                      </div>

                      {/* Quick Amenities Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {post.room?.hasElectricVehicleCharging && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            ⚡ Sạc xe điện
                          </span>
                        )}
                        {post.room?.allowPets && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                            🐾 Nuôi pet
                          </span>
                        )}
                        {post.room?.freeHours && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                            🕒 Tự do
                          </span>
                        )}
                        {post.room?.parkingSlots > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                            🛵 Có chỗ xe
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Landlord Contact Footer & Action Button */}
                  <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                        {post.room?.landlord?.fullName
                          ?.charAt(0)
                          .toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 truncate">
                          {post.room?.landlord?.fullName || "Chủ trọ"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/posts/${post.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                      </Link>

                      {user && user.id === post.room?.landlord?.id ? (
                        <Link
                          to="/my-posts"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                        </Link>
                      ) : post.room?.landlord?.phoneNumber ||
                        post.room?.landlord?.phone ? (
                        <a
                          href={`tel:${post.room?.landlord?.phoneNumber || post.room?.landlord?.phone}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition"
                          title="Gọi điện"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      ) : null}
                    </div>
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
